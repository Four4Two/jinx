import type { AssetId } from '@shapeshiftoss/caip'
import type { Asset } from 'lib/asset-service'

const jinx: Partial<Asset> = {
  color: '#3761F9',
  icon: 'https://assets.coincap.io/assets/icons/256/jinx.png',
}

export const overrideAssets: Record<AssetId, Partial<Asset>> = {
  'eip155:1/erc20:0xc770eefad204b5180df6a14ee197d99d808ee52d': {
    name: 'JINX on Ethereum',
    ...jinx,
  },
  'eip155:10/erc20:0xf1a0da3367bc7aa04f8d94ba57b862ff37ced174': {
    name: 'JINX on Optimism',
    ...jinx,
  },
  'eip155:100/erc20:0x21a42669643f45bc0e086b8fc2ed70c23d67509d': {
    name: 'JINX on Gnosis',
    ...jinx,
  },
  'eip155:137/erc20:0x65a05db8322701724c197af82c9cae41195b0aa8': {
    name: 'JINX on Polygon',
    ...jinx,
  },
  'eip155:100/erc20:0xddafbb505ad214d7b80b1f830fccc89b60fb7a83': {
    name: 'USD Coin on Gnosis',
    precision: 6,
  },
}
