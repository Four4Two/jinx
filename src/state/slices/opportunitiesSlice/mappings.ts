import {
  avalancheChainId,
  bchChainId,
  btcChainId,
  cosmosChainId,
  dogeChainId,
  ethChainId,
  ltcChainId,
} from '@sudophunk/caip'
import pipe from 'lodash/flow'

import {
  cosmosSdkOpportunityIdsResolver,
  cosmosSdkStakingOpportunitiesMetadataResolver,
  cosmosSdkStakingOpportunitiesUserDataResolver,
} from './resolvers/cosmosSdk'
import {
  ethJinxStakingMetadataResolver,
  ethJinxStakingOpportunityIdsResolver,
  ethJinxStakingUserDataResolver,
} from './resolvers/ethJinxStaking'
import {
  idleStakingOpportunitiesMetadataResolver,
  idleStakingOpportunitiesUserDataResolver,
  idleStakingOpportunityIdsResolver,
} from './resolvers/idle'
import {
  jinxyStakingOpportunitiesMetadataResolver,
  jinxyStakingOpportunitiesUserDataResolver,
  jinxyStakingOpportunityIdsResolver,
} from './resolvers/jinxy'
import {
  thorchainSaversOpportunityIdsResolver,
  thorchainSaversStakingOpportunitiesMetadataResolver,
  thorchainSaversStakingOpportunitiesUserDataResolver,
} from './resolvers/thorchainsavers'
import {
  uniV2LpLpOpportunityIdsResolver,
  uniV2LpOpportunitiesMetadataResolver,
  uniV2LpUserDataResolver,
} from './resolvers/uniV2'
import type {
  DefiProviderToMetadataResolver,
  DefiProviderToOpportunitiesMetadataResolver,
  DefiProviderToOpportunitiesUserDataResolver,
  DefiProviderToOpportunityIdsResolver,
  DefiProviderToOpportunityUserDataResolver,
} from './types'
import { DefiProvider, DefiType } from './types'

export const DefiProviderToMetadataResolverByDeFiType: DefiProviderToMetadataResolver = {
  [`${DefiProvider.EthJinxStaking}`]: {
    [`${DefiType.Staking}`]: ethJinxStakingMetadataResolver,
  },
}

export const DefiProviderToOpportunitiesMetadataResolverByDeFiType: DefiProviderToOpportunitiesMetadataResolver =
  {
    [`${DefiProvider.UniV2}`]: {
      [`${DefiType.LiquidityPool}`]: uniV2LpOpportunitiesMetadataResolver,
    },
    [`${DefiProvider.Idle}`]: {
      [`${DefiType.Staking}`]: idleStakingOpportunitiesMetadataResolver,
    },
    [`${DefiProvider.CosmosSdk}`]: {
      [`${DefiType.Staking}`]: cosmosSdkStakingOpportunitiesMetadataResolver,
    },
    [`${DefiProvider.ThorchainSavers}`]: {
      [`${DefiType.Staking}`]: thorchainSaversStakingOpportunitiesMetadataResolver,
    },
    [`${DefiProvider.BlackFury}`]: {
      [`${DefiType.Staking}`]: jinxyStakingOpportunitiesMetadataResolver,
    },
  }

export const DefiProviderToOpportunitiesUserDataResolverByDeFiType: DefiProviderToOpportunitiesUserDataResolver =
  {
    [`${DefiProvider.Idle}`]: {
      [`${DefiType.Staking}`]: idleStakingOpportunitiesUserDataResolver,
    },
    [`${DefiProvider.BlackFury}`]: {
      [`${DefiType.Staking}`]: jinxyStakingOpportunitiesUserDataResolver,
    },
    [`${DefiProvider.ThorchainSavers}`]: {
      [`${DefiType.Staking}`]: thorchainSaversStakingOpportunitiesUserDataResolver,
    },
    [`${DefiProvider.CosmosSdk}`]: {
      [`${DefiType.Staking}`]: cosmosSdkStakingOpportunitiesUserDataResolver,
    },
  }

export const DefiProviderToOpportunityIdsResolverByDeFiType: DefiProviderToOpportunityIdsResolver =
  {
    [`${DefiProvider.UniV2}`]: {
      [`${DefiType.LiquidityPool}`]: uniV2LpLpOpportunityIdsResolver,
    },
    [`${DefiProvider.EthJinxStaking}`]: {
      [`${DefiType.Staking}`]: ethJinxStakingOpportunityIdsResolver,
    },
    [`${DefiProvider.Idle}`]: {
      [`${DefiType.Staking}`]: idleStakingOpportunityIdsResolver,
    },
    [`${DefiProvider.ThorchainSavers}`]: {
      [`${DefiType.Staking}`]: thorchainSaversOpportunityIdsResolver,
    },
    [`${DefiProvider.BlackFury}`]: {
      [`${DefiType.Staking}`]: jinxyStakingOpportunityIdsResolver,
    },
    [`${DefiProvider.CosmosSdk}`]: {
      [`${DefiType.Staking}`]: cosmosSdkOpportunityIdsResolver,
    },
  }

export const DefiProviderToUserDataResolverByDeFiType: DefiProviderToOpportunityUserDataResolver = {
  [`${DefiProvider.UniV2}`]: {
    [`${DefiType.LiquidityPool}`]: uniV2LpUserDataResolver,
  },
  [`${DefiProvider.EthJinxStaking}`]: {
    [`${DefiType.Staking}`]: ethJinxStakingUserDataResolver,
  },
}

export const CHAIN_ID_TO_SUPPORTED_DEFI_OPPORTUNITIES = {
  [avalancheChainId]: [
    {
      defiProvider: DefiProvider.ThorchainSavers,
      defiType: DefiType.Staking,
    },
  ],
  [ltcChainId]: [
    {
      defiProvider: DefiProvider.ThorchainSavers,
      defiType: DefiType.Staking,
    },
  ],
  [bchChainId]: [
    {
      defiProvider: DefiProvider.ThorchainSavers,
      defiType: DefiType.Staking,
    },
  ],
  [dogeChainId]: [
    {
      defiProvider: DefiProvider.ThorchainSavers,
      defiType: DefiType.Staking,
    },
  ],
  [btcChainId]: [
    {
      defiProvider: DefiProvider.ThorchainSavers,
      defiType: DefiType.Staking,
    },
  ],
  [ethChainId]: [
    {
      defiProvider: DefiProvider.UniV2,
      defiType: DefiType.LiquidityPool,
    },
    {
      defiProvider: DefiProvider.EthJinxStaking,
      defiType: DefiType.Staking,
    },
    {
      defiProvider: DefiProvider.Idle,
      defiType: DefiType.Staking,
    },
    {
      defiProvider: DefiProvider.ThorchainSavers,
      defiType: DefiType.Staking,
    },
    {
      defiProvider: DefiProvider.BlackFury,
      defiType: DefiType.Staking,
    },
  ],
  [cosmosChainId]: [
    {
      defiProvider: DefiProvider.CosmosSdk,
      defiType: DefiType.Staking,
    },
    {
      defiProvider: DefiProvider.ThorchainSavers,
      defiType: DefiType.Staking,
    },
  ],
}

// Single opportunity metadata resolvers
// "Give me the resolvers for a given DeFi provider"
export const getDefiProviderMetadataResolvers = (defiProvider: DefiProvider) =>
  DefiProviderToMetadataResolverByDeFiType[defiProvider]
// "Give me the resolvers for a given DeFi type"
export const getDefiTypeMetadataResolvers = (
  defiType: DefiType,
  resolversByType: ReturnType<typeof getDefiProviderMetadataResolvers>,
) => resolversByType?.[defiType]

export const getMetadataResolversByDefiProviderAndDefiType = (
  defiProvider: DefiProvider,
  defiType: DefiType,
) =>
  pipe(
    getDefiProviderMetadataResolvers,
    getDefiTypeMetadataResolvers.bind(this, defiType),
  )(defiProvider)

// Many opportunity metadata resolvers
// "Give me the resolvers for a given DeFi provider"
export const getDefiProviderOpportunitiesMetadataResolvers = (defiProvider: DefiProvider) =>
  DefiProviderToOpportunitiesMetadataResolverByDeFiType[defiProvider]
// "Give me the resolvers for a given DeFi type"
export const getDefiTypeOpportunitiesMetadataResolvers = (
  defiType: DefiType,
  resolversByType: ReturnType<typeof getDefiProviderOpportunitiesMetadataResolvers>,
) => resolversByType?.[defiType]

export const getOpportunitiesMetadataResolversByDefiProviderAndDefiType = (
  defiProvider: DefiProvider,
  defiType: DefiType,
) =>
  pipe(
    getDefiProviderOpportunitiesMetadataResolvers,
    getDefiTypeOpportunitiesMetadataResolvers.bind(this, defiType),
  )(defiProvider)

// "Give me the resolvers for a given DeFi provider"
export const getDefiProviderUserDataResolvers = (defiProvider: DefiProvider) =>
  DefiProviderToUserDataResolverByDeFiType[defiProvider]
// "Give me the resolvers for a given DeFi type"
export const getDefiTypeUserDataResolvers = (
  defiType: DefiType,
  resolversByType: ReturnType<typeof getDefiProviderUserDataResolvers>,
) => resolversByType?.[defiType]

export const getUserDataResolversByDefiProviderAndDefiType = (
  defiProvider: DefiProvider,
  defiType: DefiType,
) =>
  pipe(
    getDefiProviderUserDataResolvers,
    getDefiTypeUserDataResolvers.bind(this, defiType),
  )(defiProvider)

// "Give me the resolvers for a given DeFi provider"
export const getDefiProviderOpportunitiesUserDataResolvers = (defiProvider: DefiProvider) =>
  DefiProviderToOpportunitiesUserDataResolverByDeFiType[defiProvider]
// "Give me the resolvers for a given DeFi type"
export const getDefiTypeOpportunitiesUserDataResolvers = (
  defiType: DefiType,
  resolversByType: ReturnType<typeof getDefiProviderOpportunitiesUserDataResolvers>,
) => resolversByType?.[defiType]

export const getOpportunitiesUserDataResolversByDefiProviderAndDefiType = (
  defiProvider: DefiProvider,
  defiType: DefiType,
) =>
  pipe(
    getDefiProviderOpportunitiesUserDataResolvers,
    getDefiTypeOpportunitiesUserDataResolvers.bind(this, defiType),
  )(defiProvider)

// "Give me the resolvers for a given DeFi provider"
export const getDefiProviderOpportunityIdsResolvers = (defiProvider: DefiProvider) =>
  DefiProviderToOpportunityIdsResolverByDeFiType[defiProvider]

// "Give me the resolvers for a given DeFi type"
export const getDefiTypeOpportunityIdsResolvers = (
  defiType: DefiType,
  resolversByType: ReturnType<typeof getDefiProviderOpportunityIdsResolvers>,
) => resolversByType?.[defiType]

export const getOpportunityIdsResolversByDefiProviderAndDefiType = (
  defiProvider: DefiProvider,
  defiType: DefiType,
) =>
  pipe(
    getDefiProviderOpportunityIdsResolvers,
    getDefiTypeOpportunityIdsResolvers.bind(this, defiType),
  )(defiProvider)
