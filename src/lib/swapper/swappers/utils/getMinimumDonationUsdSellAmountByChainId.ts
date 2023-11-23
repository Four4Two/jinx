import type { ChainId } from '@sudophunk/caip'
import { ethChainId } from '@sudophunk/caip'

export const getMinimumDonationUsdSellAmountByChainId = (chainId: ChainId) => {
  switch (chainId) {
    case ethChainId:
      return '500'
    default:
      return '0'
  }
}
