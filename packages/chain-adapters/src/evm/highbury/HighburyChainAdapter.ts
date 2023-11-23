import type { AssetId } from '@sudophunk/caip'
import { ASSET_REFERENCE, highburyAssetId } from '@sudophunk/caip'
import type { BIP44Params } from '@shapeshiftoss/types'
import { KnownChainIds } from '@shapeshiftoss/types'
import * as unchained from '@shapeshiftoss/unchained-client'

// import type { ValidAddressResult } from '../../types'
import { ChainAdapterDisplayName } from '../../types'
import type { ChainAdapterArgs } from '../EvmBaseAdapter'
import { EvmBaseAdapter } from '../EvmBaseAdapter'

const SUPPORTED_CHAIN_IDS = [KnownChainIds.HighburyMainnet]
const DEFAULT_CHAIN_ID = KnownChainIds.HighburyMainnet

export class ChainAdapter extends EvmBaseAdapter<KnownChainIds.HighburyMainnet> {
  static readonly defaultBIP44Params: BIP44Params = {
    purpose: 44,
    coinType: Number(ASSET_REFERENCE.Highbury),
    accountNumber: 0,
  }

  constructor(args: ChainAdapterArgs<unchained.highbury.V1Api>) {
    super({
      assetId: highburyAssetId,
      chainId: DEFAULT_CHAIN_ID,
      defaultBIP44Params: ChainAdapter.defaultBIP44Params,
      parser: new unchained.highbury.TransactionParser({
        assetId: highburyAssetId,
        chainId: args.chainId ?? DEFAULT_CHAIN_ID,
        rpcUrl: args.rpcUrl,
        api: args.providers.http,
      }),
      supportedChainIds: SUPPORTED_CHAIN_IDS,
      ...args,
    })
  }

  getDisplayName() {
    return ChainAdapterDisplayName.Highbury
  }

  getName() {
    const enumIndex = Object.values(ChainAdapterDisplayName).indexOf(
      ChainAdapterDisplayName.Highbury,
    )
    return Object.keys(ChainAdapterDisplayName)[enumIndex]
  }

  getType(): KnownChainIds.HighburyMainnet {
    return KnownChainIds.HighburyMainnet
  }

  getFeeAssetId(): AssetId {
    return this.assetId
  }
}
