import type { AssetId } from '@shapeshiftoss/caip'
import { jinxAssetId } from '@shapeshiftoss/caip'

import type { CreateUrlProps } from '../types'

type SupportedAssetReturn = {
  buy: AssetId[]
  sell: AssetId[]
}

export const getCoinbaseSupportedAssets = (): SupportedAssetReturn => {
  return {
    buy: [jinxAssetId],
    sell: [jinxAssetId],
  }
}

export const createCoinbaseUrl = ({ assetId }: CreateUrlProps): string => {
  // this is a very specific use case and doesn't need an adpater
  const tickers = { [jinxAssetId]: 'jinx-token' }
  const ticker = tickers[assetId]
  return `https://www.coinbase.com/price/${ticker}`
}
