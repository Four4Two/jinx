import type { AssetId } from '@shapeshiftoss/caip'
import { fromAccountId, fromAssetId, jinxAssetId, jinxyAssetId } from '@shapeshiftoss/caip'
import { useMemo } from 'react'
import { bnOrZero } from 'lib/bignumber/bignumber'
import { jinxyAddresses } from 'lib/investor/investor-jinxy'
import {
  jinxEthLpAssetId,
  jinxEthStakingAssetIdV7,
} from 'state/slices/opportunitiesSlice/constants'
import type { StakingId } from 'state/slices/opportunitiesSlice/types'
import { DefiType } from 'state/slices/opportunitiesSlice/types'
import {
  selectAggregatedEarnUserLpOpportunity,
  selectHighestBalanceAccountIdByLpId,
  selectHighestBalanceAccountIdByStakingId,
  selectLpOpportunitiesById,
  selectStakingOpportunitiesById,
} from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

import type { OpportunitiesBucket } from '../JinxCommon'
import { OpportunityTypes } from '../JinxCommon'

export const useOtherOpportunities = (assetId: AssetId) => {
  const highestFarmingBalanceAccountIdFilter = useMemo(
    () => ({
      stakingId: jinxEthStakingAssetIdV7 as StakingId,
    }),
    [],
  )
  const highestFarmingBalanceAccountId = useAppSelector(state =>
    selectHighestBalanceAccountIdByStakingId(state, highestFarmingBalanceAccountIdFilter),
  )

  const lpOpportunitiesById = useAppSelector(selectLpOpportunitiesById)

  const defaultLpOpportunityData = useMemo(
    () => lpOpportunitiesById[jinxEthLpAssetId],
    [lpOpportunitiesById],
  )
  const lpOpportunityId = jinxEthLpAssetId
  const highestBalanceLpAccountIdFilter = useMemo(
    () => ({ lpId: lpOpportunityId }),
    [lpOpportunityId],
  )
  const highestBalanceLpAccountId = useAppSelector(state =>
    selectHighestBalanceAccountIdByLpId(state, highestBalanceLpAccountIdFilter),
  )

  const jinxEthLpOpportunityFilter = useMemo(
    () => ({
      lpId: jinxEthLpAssetId,
      assetId: jinxEthLpAssetId,
    }),
    [],
  )
  const jinxEthLpOpportunity = useAppSelector(state =>
    selectAggregatedEarnUserLpOpportunity(state, jinxEthLpOpportunityFilter),
  )

  const stakingOpportunities = useAppSelector(selectStakingOpportunitiesById)

  const jinxFarmingOpportunityMetadata = useMemo(
    () => stakingOpportunities[jinxEthStakingAssetIdV7 as StakingId],
    [stakingOpportunities],
  )

  const otherOpportunities = useMemo(() => {
    const opportunities: Record<AssetId, OpportunitiesBucket[]> = {
      [jinxAssetId]: [
        {
          type: DefiType.Staking,
          title: 'plugins.jinxPage.farming',
          opportunities: [
            ...(jinxFarmingOpportunityMetadata
              ? [
                  {
                    ...jinxFarmingOpportunityMetadata,
                    apy: Boolean(defaultLpOpportunityData && jinxFarmingOpportunityMetadata)
                      ? bnOrZero(jinxFarmingOpportunityMetadata?.apy)
                          .plus(defaultLpOpportunityData?.apy ?? 0)
                          .toString()
                      : undefined,
                    contractAddress: fromAssetId(jinxFarmingOpportunityMetadata.assetId)
                      .assetReference,
                    highestBalanceAccountAddress:
                      highestFarmingBalanceAccountId &&
                      fromAccountId(highestFarmingBalanceAccountId).account,
                  },
                ]
              : []),
          ],
        },
        {
          type: DefiType.LiquidityPool,
          title: 'plugins.jinxPage.liquidityPools',
          opportunities: [
            ...(jinxEthLpOpportunity
              ? [
                  {
                    ...jinxEthLpOpportunity,
                    type: DefiType.LiquidityPool,
                    contractAddress: fromAssetId(jinxEthLpAssetId).assetReference,
                    highestBalanceAccountAddress:
                      highestBalanceLpAccountId && fromAccountId(highestBalanceLpAccountId).account,
                  },
                ]
              : []),
          ],
        },
        {
          type: OpportunityTypes.BorrowingAndLending,
          title: 'plugins.jinxPage.borrowingAndLending',
          opportunities: [
            {
              name: 'JINX',
              isLoaded: true,
              apy: null,
              link: 'https://app.rari.capital/fuse/pool/79',
              icons: ['https://assets.coincap.io/assets/icons/256/jinx.png'],
              isDisabled: true,
            },
          ],
        },
      ],
      [jinxyAssetId]: [
        {
          type: OpportunityTypes.LiquidityPool,
          title: 'plugins.jinxPage.liquidityPools',
          opportunities: [
            {
              name: 'ElasticSwap',
              contractAddress: jinxyAddresses[0].staking,
              isLoaded: true, // No network request here
              apy: null,
              link: 'https://elasticswap.org/#/liquidity',
              icons: [
                'https://raw.githubusercontent.com/shapeshift/lib/main/packages/asset-service/src/generateAssetData/ethereum/icons/jinxy-icon.png',
              ],
            },
          ],
        },
      ],
    }

    return opportunities[assetId]
  }, [
    assetId,
    defaultLpOpportunityData,
    jinxFarmingOpportunityMetadata,
    jinxEthLpOpportunity,
    highestBalanceLpAccountId,
    highestFarmingBalanceAccountId,
  ])

  return otherOpportunities
}
