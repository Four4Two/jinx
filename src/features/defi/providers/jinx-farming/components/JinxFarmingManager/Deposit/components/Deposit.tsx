import { useToast } from '@chakra-ui/react'
import type { AccountId } from '@sudophunk/caip'
import { toAssetId } from '@sudophunk/caip'
import type { DepositValues } from 'features/defi/components/Deposit/Deposit'
import { Deposit as ReusableDeposit } from 'features/defi/components/Deposit/Deposit'
import type {
  DefiParams,
  DefiQueryParams,
} from 'features/defi/contexts/DefiManagerProvider/DefiCommon'
import { DefiAction, DefiStep } from 'features/defi/contexts/DefiManagerProvider/DefiCommon'
import { useJinxFarming } from 'features/defi/providers/jinx-farming/hooks/useJinxFarming'
import { useUniV2LiquidityPool } from 'features/defi/providers/univ2/hooks/useUniV2LiquidityPool'
import qs from 'qs'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslate } from 'react-polyglot'
import { useHistory } from 'react-router-dom'
import type { AccountDropdownProps } from 'components/AccountDropdown/AccountDropdown'
import type { StepComponentProps } from 'components/DeFi/components/Steps'
import { getChainAdapterManager } from 'context/PluginProvider/chainAdapterSingleton'
import { useBrowserRouter } from 'hooks/useBrowserRouter/useBrowserRouter'
import { bn, bnOrZero } from 'lib/bignumber/bignumber'
import { fromBaseUnit } from 'lib/math'
import { trackOpportunityEvent } from 'lib/mixpanel/helpers'
import { MixPanelEvents } from 'lib/mixpanel/types'
import { assertIsJinxEthStakingContractAddress } from 'state/slices/opportunitiesSlice/constants'
import { toOpportunityId } from 'state/slices/opportunitiesSlice/utils'
import {
  selectAggregatedEarnUserStakingOpportunityByStakingId,
  selectAssetById,
  selectAssets,
  selectMarketDataById,
  selectPortfolioCryptoBalanceBaseUnitByFilter,
} from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

import { JinxFarmingDepositActionType } from '../DepositCommon'
import { DepositContext } from '../DepositContext'

type DepositProps = StepComponentProps & {
  accountId?: AccountId | undefined
  onAccountIdChange: AccountDropdownProps['onChange']
}
export const Deposit: React.FC<DepositProps> = ({
  accountId,
  onAccountIdChange: handleAccountIdChange,
  onNext,
}) => {
  const [lpTokenPrice, setLpTokenPrice] = useState<string | null>(null)
  const { state, dispatch } = useContext(DepositContext)
  const history = useHistory()
  const translate = useTranslate()
  const { query, history: browserHistory } = useBrowserRouter<DefiQueryParams, DefiParams>()
  const { assetNamespace, assetReference, chainId, contractAddress, rewardId } = query

  const jinxFarmingOpportunityFilter = useMemo(
    () => ({
      stakingId: toOpportunityId({
        assetNamespace,
        assetReference: contractAddress,
        chainId,
      }),
    }),
    [assetNamespace, chainId, contractAddress],
  )
  const jinxFarmingOpportunity = useAppSelector(state =>
    selectAggregatedEarnUserStakingOpportunityByStakingId(state, jinxFarmingOpportunityFilter),
  )

  const assets = useAppSelector(selectAssets)

  const asset = useAppSelector(state =>
    selectAssetById(state, jinxFarmingOpportunity?.underlyingAssetId ?? ''),
  )

  const underlyingAssetId = jinxFarmingOpportunity?.underlyingAssetId

  const cryptoBalanceFilter = useMemo(
    () => ({ assetId: underlyingAssetId, accountId }),
    [accountId, underlyingAssetId],
  )
  const cryptoBalance = useAppSelector(state =>
    selectPortfolioCryptoBalanceBaseUnitByFilter(state, cryptoBalanceFilter),
  )

  const { getLpTokenPrice } = useUniV2LiquidityPool({
    accountId: accountId ?? '',
    assetId0: jinxFarmingOpportunity?.underlyingAssetIds[0] ?? '',
    assetId1: jinxFarmingOpportunity?.underlyingAssetIds[1] ?? '',
    lpAssetId: underlyingAssetId ?? '',
  })

  assertIsJinxEthStakingContractAddress(contractAddress)

  const {
    allowance: jinxFarmingAllowance,
    getStakeFees,
    getApproveFees,
  } = useJinxFarming(contractAddress)

  const feeAssetId = getChainAdapterManager().get(chainId)?.getFeeAssetId()
  if (!feeAssetId) throw new Error(`AssetId not found for ChainId ${chainId}`)
  const feeAsset = useAppSelector(state => selectAssetById(state, feeAssetId))
  if (!feeAssetId) throw new Error(`Asset not found for AssetId ${feeAssetId}`)

  const rewardAssetId = toAssetId({
    chainId,
    assetNamespace,
    assetReference: rewardId,
  })
  const rewardAsset = useAppSelector(state => selectAssetById(state, rewardAssetId))

  const marketData = useAppSelector(state => selectMarketDataById(state, underlyingAssetId ?? ''))

  // notify
  const toast = useToast()

  useEffect(() => {
    ;(async () => {
      const lpPrice = await getLpTokenPrice()
      if (lpPrice) setLpTokenPrice(lpPrice.toString())
    })()
  }, [getLpTokenPrice])

  const handleContinue = useCallback(
    async (formValues: DepositValues) => {
      if (!(state && dispatch && feeAsset && jinxFarmingOpportunity)) return

      const getDepositGasEstimateCryptoPrecision = async (
        deposit: DepositValues,
      ): Promise<string | undefined> => {
        if (!assetReference) return
        try {
          const fees = await getStakeFees(deposit.cryptoAmount)
          if (!fees) return
          return fromBaseUnit(fees.networkFeeCryptoBaseUnit, feeAsset.precision)
        } catch (error) {
          console.error(error)
          toast({
            position: 'top-right',
            description: translate('common.somethingWentWrongBody'),
            title: translate('common.somethingWentWrong'),
            status: 'error',
          })
        }
      }

      // set deposit state for future use
      dispatch({ type: JinxFarmingDepositActionType.SET_DEPOSIT, payload: formValues })
      dispatch({ type: JinxFarmingDepositActionType.SET_LOADING, payload: true })
      try {
        if (!asset) return
        // Check if approval is required for user address
        const _allowance = await jinxFarmingAllowance()
        const allowance = bn(fromBaseUnit(bnOrZero(_allowance), asset.precision))

        // Skip approval step if user allowance is greater than or equal requested deposit amount
        if (allowance.gte(formValues.cryptoAmount)) {
          const estimatedGasCrypto = await getDepositGasEstimateCryptoPrecision(formValues)
          if (!estimatedGasCrypto) return
          dispatch({
            type: JinxFarmingDepositActionType.SET_DEPOSIT,
            payload: { estimatedGasCryptoPrecision: estimatedGasCrypto },
          })
          onNext(DefiStep.Confirm)
          dispatch({ type: JinxFarmingDepositActionType.SET_LOADING, payload: false })
          trackOpportunityEvent(
            MixPanelEvents.DepositContinue,
            {
              opportunity: jinxFarmingOpportunity,
              fiatAmounts: [formValues.fiatAmount],
              cryptoAmounts: [
                { assetId: asset.assetId, amountCryptoHuman: formValues.cryptoAmount },
              ],
            },
            assets,
          )
        } else {
          const fees = await getApproveFees()
          if (!fees) return
          dispatch({
            type: JinxFarmingDepositActionType.SET_APPROVE,
            payload: {
              estimatedGasCryptoPrecision: fromBaseUnit(
                fees.networkFeeCryptoBaseUnit,
                feeAsset.precision,
              ),
            },
          })
          dispatch({ type: JinxFarmingDepositActionType.SET_LOADING, payload: false })
          onNext(DefiStep.Approve)
        }
      } catch (error) {
        console.error(error)
        toast({
          position: 'top-right',
          description: translate('common.somethingWentWrongBody'),
          title: translate('common.somethingWentWrong'),
          status: 'error',
        })
        dispatch({ type: JinxFarmingDepositActionType.SET_LOADING, payload: false })
      }
    },
    [
      state,
      dispatch,
      feeAsset,
      jinxFarmingOpportunity,
      assetReference,
      getStakeFees,
      toast,
      translate,
      asset,
      jinxFarmingAllowance,
      onNext,
      assets,
      getApproveFees,
    ],
  )

  const cryptoHumanAmountAvailable = useMemo(
    () => fromBaseUnit(cryptoBalance, asset?.precision ?? 1),
    [asset?.precision, cryptoBalance],
  )
  const fiatAmountAvailable = useMemo(
    () => bnOrZero(cryptoHumanAmountAvailable).times(marketData?.price),
    [cryptoHumanAmountAvailable, marketData?.price],
  )

  const validateCryptoAmount = useCallback(
    (value: string) => {
      if (!asset) return
      const crypto = bn(fromBaseUnit(cryptoBalance, asset.precision))
      const _value = bnOrZero(value)
      const hasValidBalance = crypto.gt(0) && _value.gt(0) && crypto.gte(value)
      if (_value.isEqualTo(0)) return ''
      return hasValidBalance || 'common.insufficientFunds'
    },
    [asset, cryptoBalance],
  )

  const validateFiatAmount = useCallback(
    (value: string) => {
      if (!asset) return
      const crypto = bn(fromBaseUnit(cryptoBalance, asset.precision))
      const fiat = crypto.times(marketData.price)
      const _value = bnOrZero(value)
      const hasValidBalance = fiat.gt(0) && _value.gt(0) && fiat.gte(value)
      if (_value.isEqualTo(0)) return ''
      return hasValidBalance || 'common.insufficientFunds'
    },
    [asset, cryptoBalance, marketData.price],
  )

  const handleBack = useCallback(() => {
    history.push({
      pathname: `/defi/earn`,
      search: qs.stringify({
        ...query,
        modal: DefiAction.Overview,
      }),
    })
  }, [history, query])

  if (!state || !dispatch || !jinxFarmingOpportunity || !asset || !marketData) return null

  const handleCancel = browserHistory.goBack

  return (
    <ReusableDeposit
      accountId={accountId}
      asset={asset}
      rewardAsset={rewardAsset}
      inputIcons={jinxFarmingOpportunity?.icons}
      apy={String(jinxFarmingOpportunity?.apy)}
      cryptoAmountAvailable={cryptoHumanAmountAvailable}
      cryptoInputValidation={{
        required: true,
        validate: { validateCryptoAmount },
      }}
      fiatAmountAvailable={fiatAmountAvailable.toFixed(2)}
      fiatInputValidation={{
        required: true,
        validate: { validateFiatAmount },
      }}
      marketData={marketData}
      onCancel={handleCancel}
      onAccountIdChange={handleAccountIdChange}
      onContinue={handleContinue}
      onBack={handleBack}
      percentOptions={[0.25, 0.5, 0.75, 1]}
      enableSlippage={false}
      isLoading={state.loading || !lpTokenPrice}
    />
  )
}
