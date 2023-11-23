import type { AssetId } from '@sudophunk/caip'
import { ethAssetId, jinxAssetId } from '@sudophunk/caip'
import {
  ETH_JINX_STAKING_CONTRACT_ADDRESS_V1,
  ETH_JINX_STAKING_CONTRACT_ADDRESS_V2,
  ETH_JINX_STAKING_CONTRACT_ADDRESS_V3,
  ETH_JINX_STAKING_CONTRACT_ADDRESS_V4,
  ETH_JINX_STAKING_CONTRACT_ADDRESS_V5,
  ETH_JINX_STAKING_CONTRACT_ADDRESS_V6,
  ETH_JINX_STAKING_CONTRACT_ADDRESS_V7,
} from 'contracts/constants'
import IdleFinanceLogo from 'assets/idle-finance.png'
import { getTypeGuardAssertion } from 'lib/utils'

import type { DefiProviderMetadata, LpId, StakingId } from './types'
import { DefiProvider } from './types'

// UniswapV2Router02 https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02
export const uniswapV2Router02AssetId: AssetId =
  'eip155:1/erc20:0x7a250d5630b4cf539739df2c5dacb4c659f2488d'
// LP contracts
export const jinxEthPair = [ethAssetId, jinxAssetId] as const
export const jinxEthLpAssetId: LpId = 'eip155:1/erc20:0x470e8de2ebaef52014a47cb5e6af86884947f08c'
export const jinxEthLpAssetIds = [jinxEthLpAssetId] as const

export const jinxEthStakingContractAddresses = [
  ETH_JINX_STAKING_CONTRACT_ADDRESS_V7,
  ETH_JINX_STAKING_CONTRACT_ADDRESS_V6,
  ETH_JINX_STAKING_CONTRACT_ADDRESS_V5,
  ETH_JINX_STAKING_CONTRACT_ADDRESS_V4,
  ETH_JINX_STAKING_CONTRACT_ADDRESS_V3,
  ETH_JINX_STAKING_CONTRACT_ADDRESS_V2,
  ETH_JINX_STAKING_CONTRACT_ADDRESS_V1,
] as const

export type JinxEthStakingContractAddress = (typeof jinxEthStakingContractAddresses)[number]

const isJinxEthStakingContractAddress = (
  address: JinxEthStakingContractAddress | string,
): address is JinxEthStakingContractAddress =>
  jinxEthStakingContractAddresses.includes(address as JinxEthStakingContractAddress)

export const assertIsJinxEthStakingContractAddress: (
  value: JinxEthStakingContractAddress | string,
) => asserts value is JinxEthStakingContractAddress = getTypeGuardAssertion(
  isJinxEthStakingContractAddress,
  "Contract address isn't a known ETH/JINX staking address",
)

export const jinxEthStakingAssetIdV1: AssetId =
  'eip155:1/erc20:0xdd80e21669a664bce83e3ad9a0d74f8dad5d9e72'
export const jinxEthStakingAssetIdV2: AssetId =
  'eip155:1/erc20:0xc54b9f82c1c54e9d4d274d633c7523f2299c42a0'
export const jinxEthStakingAssetIdV3: AssetId =
  'eip155:1/erc20:0x212ebf9fd3c10f371557b08e993eaab385c3932b'
export const jinxEthStakingAssetIdV4: AssetId =
  'eip155:1/erc20:0x24fd7fb95dc742e23dc3829d3e656feeb5f67fa0'
export const jinxEthStakingAssetIdV5: AssetId =
  'eip155:1/erc20:0xc14eaa8284feff79edc118e06cadbf3813a7e555'
export const jinxEthStakingAssetIdV6: AssetId =
  'eip155:1/erc20:0xebb1761ad43034fd7faa64d84e5bbd8cb5c40b68'
export const jinxEthStakingAssetIdV7: AssetId =
  'eip155:1/erc20:0x5939783dbf3e9f453a69bc9ddc1e492efac1fbcb'

// Tuple of all staking contracts as AssetIds, to iterate over and dispatch RTK queries for
export const jinxEthAssetIds = [
  jinxEthStakingAssetIdV1,
  jinxEthStakingAssetIdV2,
  jinxEthStakingAssetIdV3,
  jinxEthStakingAssetIdV4,
  jinxEthStakingAssetIdV5,
  jinxEthStakingAssetIdV6,
  jinxEthStakingAssetIdV7,
] as const
export const jinxEthStakingIds = jinxEthAssetIds as readonly StakingId[]

export const STAKING_ID_TO_VERSION = {
  [jinxEthStakingAssetIdV1]: 'V1',
  [jinxEthStakingAssetIdV2]: 'V2',
  [jinxEthStakingAssetIdV3]: 'V3',
  [jinxEthStakingAssetIdV4]: 'V4',
  [jinxEthStakingAssetIdV5]: 'V5',
  [jinxEthStakingAssetIdV6]: 'V6',
  [jinxEthStakingAssetIdV7]: 'V7',
}

export const STAKING_ID_DELIMITER = '*'

export const DEFI_PROVIDER_TO_METADATA: Record<DefiProvider, DefiProviderMetadata> = {
  [DefiProvider.Idle]: {
    provider: DefiProvider.Idle,
    icon: IdleFinanceLogo,
    color: '#1B14DC',
    url: 'https://idle.finance',
  },
  [DefiProvider.BlackFury]: {
    provider: DefiProvider.BlackFury,
    icon: 'https://assets.coincap.io/assets/icons/256/jinx.png',
    color: '#3761F9',
    url: 'https://app.jinx.army',
  },
  [DefiProvider.EthJinxStaking]: {
    provider: DefiProvider.EthJinxStaking,
    icon: 'https://assets.coincap.io/assets/icons/256/jinx.png',
    color: '#00CD98',
    url: 'https://app.jinx.army',
  },
  [DefiProvider.UniV2]: {
    provider: DefiProvider.UniV2,
    icon: 'https://assets.coingecko.com/coins/images/12504/thumb/uniswap-uni.png?1600306604',
    color: '#FD0078',
    url: 'https://app.uniswap.org',
  },
  [DefiProvider.CosmosSdk]: {
    provider: DefiProvider.CosmosSdk,
    icon: 'https://assets.coincap.io/assets/icons/256/atom.png',
    color: '#C5B5F2',
    url: 'https://app.jinx.army',
  },
  [DefiProvider.ThorchainSavers]: {
    provider: DefiProvider.ThorchainSavers,
    icon: 'https://assets.coincap.io/assets/icons/rune@2x.png',
    color: '#0CDBE0',
    url: 'https://app.jinx.army',
  },
}
