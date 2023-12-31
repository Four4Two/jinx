import type { Result } from '@sniptt/monads'
import { Err, Ok } from '@sniptt/monads'
import { getConfig } from 'config'
import type { Asset } from 'lib/asset-service'
import { getInboundAddressDataForChain } from 'lib/swapper/swappers/ThorchainSwapper/utils/getInboundAddressDataForChain'
import type { SwapErrorRight } from 'lib/swapper/types'

type GetThorTxInfoArgs = {
  sellAsset: Asset
  xpub: string
  memo: string
}
type GetThorTxInfoReturn = Promise<
  Result<
    {
      opReturnData: string
      vault: string
      pubkey: string
    },
    SwapErrorRight
  >
>

export const getThorTxInfo = async ({
  sellAsset,
  xpub,
  memo,
}: GetThorTxInfoArgs): GetThorTxInfoReturn => {
  const daemonUrl = getConfig().REACT_APP_THORCHAIN_NODE_URL
  const maybeInboundAddress = await getInboundAddressDataForChain(
    daemonUrl,
    sellAsset.assetId,
    false,
  )

  if (maybeInboundAddress.isErr()) return Err(maybeInboundAddress.unwrapErr())
  const inboundAddress = maybeInboundAddress.unwrap()
  const vault = inboundAddress.address

  return Ok({
    opReturnData: memo,
    vault,
    pubkey: xpub,
  })
}
