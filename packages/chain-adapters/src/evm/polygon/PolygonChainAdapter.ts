import type { AssetId } from '@sudophunk/caip'
import { ASSET_REFERENCE, polygonAssetId } from '@sudophunk/caip'
import type { BIP44Params } from '@shapeshiftoss/types'
import { KnownChainIds } from '@shapeshiftoss/types'
import * as unchained from '@shapeshiftoss/unchained-client'

import { ChainAdapterDisplayName } from '../../types'
import type { ChainAdapterArgs } from '../EvmBaseAdapter'
import { EvmBaseAdapter } from '../EvmBaseAdapter'

const SUPPORTED_CHAIN_IDS = [KnownChainIds.PolygonMainnet]
const DEFAULT_CHAIN_ID = KnownChainIds.PolygonMainnet

export class ChainAdapter extends EvmBaseAdapter<KnownChainIds.PolygonMainnet> {
  public static readonly defaultBIP44Params: BIP44Params = {
    purpose: 44,
    coinType: Number(ASSET_REFERENCE.Polygon),
    accountNumber: 0,
  }

  constructor(args: ChainAdapterArgs<unchained.polygon.V1Api>) {
    super({
      assetId: polygonAssetId,
      chainId: DEFAULT_CHAIN_ID,
      supportedChainIds: SUPPORTED_CHAIN_IDS,
      defaultBIP44Params: ChainAdapter.defaultBIP44Params,
      parser: new unchained.polygon.TransactionParser({
        assetId: polygonAssetId,
        chainId: args.chainId ?? DEFAULT_CHAIN_ID,
        rpcUrl: args.rpcUrl,
        api: args.providers.http,
      }),
      ...args,
    })
  }

  getDisplayName() {
    return ChainAdapterDisplayName.Polygon
  }

  getName() {
    const enumIndex = Object.values(ChainAdapterDisplayName).indexOf(
      ChainAdapterDisplayName.Polygon,
    )
    return Object.keys(ChainAdapterDisplayName)[enumIndex]
  }

  getType(): KnownChainIds.PolygonMainnet {
    return KnownChainIds.PolygonMainnet
  }

  getFeeAssetId(): AssetId {
    return this.assetId
  }
}
