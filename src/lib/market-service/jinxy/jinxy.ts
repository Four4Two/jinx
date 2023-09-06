import { ethereum } from '@shapeshiftoss/chain-adapters'
import type {
  HistoryData,
  MarketCapResult,
  MarketData,
  MarketDataArgs,
  PriceHistoryArgs,
} from '@shapeshiftoss/types'
import * as unchained from '@shapeshiftoss/unchained-client'
import { jinxyAddresses, JinxyApi } from 'lib/investor/investor-jinxy'

import type { MarketService } from '../api'
import { CoinGeckoMarketService } from '../coingecko/coingecko'
import type { ProviderUrls } from '../market-service-manager'

export const JINXY_ASSET_ID = 'eip155:1/erc20:0xDc49108ce5C57bc3408c3A5E95F3d864eC386Ed3'
const JINX_ASSET_ID = 'eip155:1/erc20:0xc770eefad204b5180df6a14ee197d99d808ee52d'
const JINXY_ASSET_PRECISION = '18'

export class JinxyMarketService extends CoinGeckoMarketService implements MarketService {
  providerUrls: ProviderUrls

  constructor({ providerUrls }: { providerUrls: ProviderUrls }) {
    super()

    this.providerUrls = providerUrls
  }

  async findAll() {
    try {
      const assetId = JINXY_ASSET_ID
      const marketData = await this.findByAssetId({ assetId })

      return { [assetId]: marketData } as MarketCapResult
    } catch (e) {
      console.warn(e)
      return {}
    }
  }

  async findByAssetId({ assetId }: MarketDataArgs): Promise<MarketData | null> {
    try {
      if (assetId.toLowerCase() !== JINXY_ASSET_ID.toLowerCase()) {
        console.warn('JinxyMarketService(findByAssetId): Failed to find by AssetId')
        return null
      }

      const coinGeckoData = await super.findByAssetId({
        assetId: JINX_ASSET_ID,
      })

      if (!coinGeckoData) return null

      const ethChainAdapter = new ethereum.ChainAdapter({
        providers: {
          ws: new unchained.ws.Client<unchained.ethereum.Tx>(
            this.providerUrls.unchainedEthereumWsUrl,
          ),
          http: new unchained.ethereum.V1Api(
            new unchained.ethereum.Configuration({
              basePath: this.providerUrls.unchainedEthereumHttpUrl,
            }),
          ),
        },
        rpcUrl: this.providerUrls.jsonRpcProviderUrl,
      })

      // Make maxSupply as an additional field, effectively EIP-20's totalSupply
      const api = new JinxyApi({
        adapter: ethChainAdapter,
        providerUrl: this.providerUrls.jsonRpcProviderUrl,
        jinxyAddresses,
      })

      const tokenContractAddress = jinxyAddresses[0].jinxy
      const jinxyTotalSupply = await api.tvl({ tokenContractAddress })
      const supply = jinxyTotalSupply

      return {
        price: coinGeckoData.price,
        marketCap: '0', // TODO: add marketCap once able to get jinxy marketCap data
        changePercent24Hr: coinGeckoData.changePercent24Hr,
        volume: '0', // TODO: add volume once able to get jinxy volume data
        supply: supply?.div(`1e+${JINXY_ASSET_PRECISION}`).toString(),
        maxSupply: jinxyTotalSupply?.div(`1e+${JINXY_ASSET_PRECISION}`).toString(),
      }
    } catch (e) {
      console.warn(e)
      throw new Error('JinxyMarketService(findByAssetId): error fetching market data')
    }
  }

  async findPriceHistoryByAssetId({
    assetId,
    timeframe,
  }: PriceHistoryArgs): Promise<HistoryData[]> {
    if (assetId.toLowerCase() !== JINXY_ASSET_ID.toLowerCase()) {
      console.warn(
        'JinxyMarketService(findPriceHistoryByAssetId): Failed to find price history by AssetId',
      )
      return []
    }

    try {
      const priceHistory = await super.findPriceHistoryByAssetId({
        assetId: JINX_ASSET_ID,
        timeframe,
      })
      return priceHistory
    } catch (e) {
      console.warn(e)
      throw new Error('JinxyMarketService(findPriceHistoryByAssetId): error fetching price history')
    }
  }
}
