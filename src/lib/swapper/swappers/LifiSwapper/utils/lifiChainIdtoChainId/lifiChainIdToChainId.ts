import type { ChainId, ChainReference } from '@sudophunk/caip'
import { CHAIN_NAMESPACE, toChainId } from '@sudophunk/caip'

export const lifiChainIdToChainId = (lifiChainId: number): ChainId => {
  return toChainId({
    chainNamespace: CHAIN_NAMESPACE.Evm,
    chainReference: lifiChainId.toString() as ChainReference,
  })
}
