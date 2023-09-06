import { CosmosManager } from 'features/defi/providers/cosmos/components/CosmosManager/CosmosManager'
import { IdleManager } from 'features/defi/providers/idle/components/IdleManager/IdleManager'
import { JinxFarmingManager } from 'features/defi/providers/jinx-farming/components/JinxFarmingManager/JinxFarmingManager'
import { JinxyManager } from 'features/defi/providers/jinxy/components/JinxyManager/JinxyManager'
import { ThorchainSaversManager } from 'features/defi/providers/thorchain-savers/components/ThorchainSaversManager/ThorchainSaversManager'
import { UniV2LpManager } from 'features/defi/providers/univ2/components/UniV2Manager/UniV2LpManager'
import { DefiProvider, DefiType } from 'state/slices/opportunitiesSlice/types'

export const DefiProviderToDefiModuleResolverByDeFiType = {
  [`${DefiProvider.UniV2}`]: {
    [`${DefiType.LiquidityPool}`]: UniV2LpManager,
  },
  [`${DefiProvider.EthJinxStaking}`]: {
    [`${DefiType.Staking}`]: JinxFarmingManager,
  },
  [DefiProvider.Idle]: {
    [`${DefiType.Staking}`]: IdleManager,
  },
  [DefiProvider.ThorchainSavers]: {
    [`${DefiType.Staking}`]: ThorchainSaversManager,
  },
  [DefiProvider.BlackFury]: JinxyManager,
  [DefiProvider.CosmosSdk]: CosmosManager,
}
// Not curried since we can either have a list of providers by DefiType, or a single one for providers not yet migrated to the abstraction
export const getDefiProviderModulesResolvers = (defiProvider: DefiProvider) =>
  DefiProviderToDefiModuleResolverByDeFiType[defiProvider]
