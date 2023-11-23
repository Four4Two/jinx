import type { AssetId } from '@sudophunk/caip'
import { thorchainAssetId } from '@sudophunk/caip'

export const isRune = (assetId: AssetId) => assetId === thorchainAssetId
