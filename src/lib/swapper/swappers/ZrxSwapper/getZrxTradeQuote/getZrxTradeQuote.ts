import type { Result } from '@sniptt/monads'
import { Err, Ok } from '@sniptt/monads'
import { getDefaultSlippageDecimalPercentageForSwapper } from 'constants/constants'
import { v4 as uuid } from 'uuid'
import { bn, bnOrZero } from 'lib/bignumber/bignumber'
import { getTreasuryAddressFromChainId } from 'lib/swapper/swappers/utils/helpers/helpers'
import type { ZrxPriceResponse } from 'lib/swapper/swappers/ZrxSwapper/types'
import {
  AFFILIATE_ADDRESS,
  OPTIMISM_L1_SWAP_GAS_LIMIT,
} from 'lib/swapper/swappers/ZrxSwapper/utils/constants'
import {
  assertValidTrade,
  assetToToken,
  baseUrlFromChainId,
  getAdapter,
} from 'lib/swapper/swappers/ZrxSwapper/utils/helpers/helpers'
import { zrxServiceFactory } from 'lib/swapper/swappers/ZrxSwapper/utils/zrxService'
import type { GetEvmTradeQuoteInput, SwapErrorRight, TradeQuote } from 'lib/swapper/types'
import { SwapErrorType, SwapperName } from 'lib/swapper/types'
import { makeSwapErrorRight } from 'lib/swapper/utils'
import { calcNetworkFeeCryptoBaseUnit } from 'lib/utils/evm'
import { convertBasisPointsToDecimalPercentage } from 'state/slices/tradeQuoteSlice/utils'

export async function getZrxTradeQuote(
  input: GetEvmTradeQuoteInput,
): Promise<Result<TradeQuote, SwapErrorRight>> {
  const {
    sellAsset,
    buyAsset,
    accountNumber,
    receiveAddress,
    affiliateBps,
    chainId,
    supportsEIP1559,
    slippageTolerancePercentage,
    sellAmountIncludingProtocolFeesCryptoBaseUnit,
  } = input

  const assertion = assertValidTrade({ buyAsset, sellAsset, receiveAddress })
  if (assertion.isErr()) return Err(assertion.unwrapErr())

  const maybeAdapter = getAdapter(chainId)
  if (maybeAdapter.isErr()) return Err(maybeAdapter.unwrapErr())
  const adapter = maybeAdapter.unwrap()

  const maybeBaseUrl = baseUrlFromChainId(buyAsset.chainId)
  if (maybeBaseUrl.isErr()) return Err(maybeBaseUrl.unwrapErr())
  const zrxService = zrxServiceFactory({ baseUrl: maybeBaseUrl.unwrap() })

  // https://docs.0x.org/0x-swap-api/api-references/get-swap-v1-price
  const maybeZrxPriceResponse = await zrxService.get<ZrxPriceResponse>('/swap/v1/price', {
    params: {
      buyToken: assetToToken(buyAsset),
      sellToken: assetToToken(sellAsset),
      sellAmount: sellAmountIncludingProtocolFeesCryptoBaseUnit,
      takerAddress: receiveAddress,
      affiliateAddress: AFFILIATE_ADDRESS, // Used for 0x analytics
      skipValidation: true,
      slippagePercentage:
        slippageTolerancePercentage ??
        getDefaultSlippageDecimalPercentageForSwapper(SwapperName.Zrx),
      feeRecipient: getTreasuryAddressFromChainId(buyAsset.chainId), // Where affiliate fees are sent
      buyTokenPercentageFee: convertBasisPointsToDecimalPercentage(affiliateBps).toNumber(),
    },
  })

  if (maybeZrxPriceResponse.isErr()) return Err(maybeZrxPriceResponse.unwrapErr())
  const { data } = maybeZrxPriceResponse.unwrap()

  const {
    buyAmount: buyAmountAfterFeesCryptoBaseUnit,
    grossBuyAmount: buyAmountBeforeFeesCryptoBaseUnit,
    price,
    allowanceTarget,
    gas,
  } = data

  const useSellAmount = !!sellAmountIncludingProtocolFeesCryptoBaseUnit
  const rate = useSellAmount ? price : bn(1).div(price).toString()

  // 0x approvals are cheaper than trades, but we don't have dynamic quote data for them.
  // Instead, we use a hardcoded gasLimit estimate in place of the estimatedGas in the 0x quote response.
  try {
    const { average } = await adapter.getGasFeeData()
    const networkFeeCryptoBaseUnit = calcNetworkFeeCryptoBaseUnit({
      ...average,
      supportsEIP1559,
      // add gas limit buffer to account for the fact we perform all of our validation on the trade quote estimations
      // which are inaccurate and not what we use for the tx to broadcast
      gasLimit: bnOrZero(gas).times(1.2).toFixed(),
      l1GasLimit: OPTIMISM_L1_SWAP_GAS_LIMIT,
    })

    return Ok({
      id: uuid(),
      estimatedExecutionTimeMs: undefined,
      receiveAddress,
      affiliateBps,
      rate,
      steps: [
        {
          allowanceContract: allowanceTarget,
          buyAsset,
          sellAsset,
          accountNumber,
          rate,
          feeData: {
            protocolFees: {},
            networkFeeCryptoBaseUnit,
          },
          buyAmountBeforeFeesCryptoBaseUnit,
          buyAmountAfterFeesCryptoBaseUnit,
          sellAmountIncludingProtocolFeesCryptoBaseUnit,
          source: SwapperName.Zrx,
        },
      ],
    })
  } catch (err) {
    return Err(
      makeSwapErrorRight({
        message: '[Zrx: tradeQuote] - failed to get fee data',
        cause: err,
        code: SwapErrorType.TRADE_QUOTE_FAILED,
      }),
    )
  }
}
