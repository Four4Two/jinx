import type { ToAssetIdArgs } from '@sudophunk/caip'
import {
  ethChainId,
  fromAccountId,
  fromAssetId,
  jinxyAssetId,
  toAssetId,
} from '@sudophunk/caip'
import dayjs from 'dayjs'
import { bn, bnOrZero } from 'lib/bignumber/bignumber'
import { jinxyApi } from 'state/apis/jinxy/jinxyApi'
import { getJinxyApi } from 'state/apis/jinxy/jinxyApiSingleton'
import { selectAssetById } from 'state/slices/assetsSlice/selectors'
import { selectPortfolioCryptoBalanceBaseUnitByFilter } from 'state/slices/common-selectors'
import { selectMarketDataById } from 'state/slices/marketDataSlice/selectors'
import { selectBIP44ParamsByAccountId } from 'state/slices/portfolioSlice/selectors'

import type {
  GetOpportunityIdsOutput,
  GetOpportunityMetadataOutput,
  GetOpportunityUserStakingDataOutput,
  OpportunitiesState,
  OpportunityMetadata,
  StakingId,
} from '../../types'
import { DefiProvider, DefiType } from '../../types'
import { serializeUserStakingId, toOpportunityId } from '../../utils'
import type {
  OpportunitiesMetadataResolverInput,
  OpportunitiesUserDataResolverInput,
} from '../types'

export const jinxyStakingOpportunitiesMetadataResolver = async ({
  defiType,
  reduxApi,
}: OpportunitiesMetadataResolverInput): Promise<{ data: GetOpportunityMetadataOutput }> => {
  const allOpportunities = await getJinxyApi().getJinxyOpportunities()

  const jinxyApr = await reduxApi.dispatch(jinxyApi.endpoints.getJinxyApr.initiate())

  const { getState } = reduxApi
  const state: any = getState() // ReduxState causes circular dependency

  const stakingOpportunitiesById: Record<StakingId, OpportunityMetadata> = {}

  for (const opportunity of allOpportunities) {
    // JINXY Token
    const rewardTokenAssetId = toAssetId({
      chainId: ethChainId,
      assetNamespace: 'erc20',
      assetReference: opportunity.rewardToken,
    })
    // JINX Token
    const tokenAssetId = toAssetId({
      chainId: ethChainId,
      assetNamespace: 'erc20',
      assetReference: opportunity.stakingToken,
    })
    // JINXy staking contract
    const toAssetIdParts: ToAssetIdArgs = {
      assetNamespace: 'erc20',
      assetReference: opportunity.contractAddress,
      chainId: ethChainId,
    }

    const assetId = toAssetId(toAssetIdParts)
    const opportunityId = toOpportunityId(toAssetIdParts)
    const underlyingAsset = selectAssetById(state, tokenAssetId)
    const marketData = selectMarketDataById(state, tokenAssetId)

    if (!underlyingAsset) continue

    const tvl = bnOrZero(opportunity.tvl)
      .div(`1e+${underlyingAsset?.precision}`)
      .times(marketData.price)
      .toString()

    const apy = jinxyApr.data?.jinxyApr ?? '0'

    stakingOpportunitiesById[opportunityId] = {
      apy,
      assetId,
      id: opportunityId,
      provider: DefiProvider.BlackFury as const,
      tvl,
      type: DefiType.Staking as const,
      underlyingAssetId: rewardTokenAssetId,
      underlyingAssetIds: [tokenAssetId],
      underlyingAssetRatiosBaseUnit: [
        bn(1).times(bn(10).pow(underlyingAsset.precision)).toString(),
      ],
      name: underlyingAsset.symbol,
      rewardAssetIds: [],
      isClaimableRewards: true,
    }
  }

  const data = {
    byId: stakingOpportunitiesById,
    type: defiType,
  }

  return { data }
}

export const jinxyStakingOpportunitiesUserDataResolver = async ({
  accountId,
  reduxApi,
  opportunityIds,
}: OpportunitiesUserDataResolverInput): Promise<{ data: GetOpportunityUserStakingDataOutput }> => {
  const { getState } = reduxApi
  const state: any = getState() // ReduxState causes circular dependency

  const stakingOpportunitiesUserDataByUserStakingId: OpportunitiesState['userStaking']['byId'] = {}

  const jinxyInvestor = getJinxyApi()

  for (const stakingOpportunityId of opportunityIds) {
    const balanceFilter = { accountId, assetId: jinxyAssetId }
    const balance = selectPortfolioCryptoBalanceBaseUnitByFilter(state, balanceFilter)

    const asset = selectAssetById(state, jinxyAssetId)
    if (!asset) continue

    const toAssetIdParts: ToAssetIdArgs = {
      assetNamespace: fromAssetId(stakingOpportunityId).assetNamespace,
      assetReference: fromAssetId(stakingOpportunityId).assetReference,
      chainId: fromAssetId(stakingOpportunityId).chainId,
    }
    const opportunityId = toOpportunityId(toAssetIdParts)
    const userStakingId = serializeUserStakingId(accountId, opportunityId)

    const opportunities = await jinxyInvestor.getJinxyOpportunities()

    // investor-jinxy is architected around many JINXy addresses/opportunity, but akchually there's only one
    if (!opportunities[0]) continue

    const opportunity = opportunities[0]

    // JINXy is a rebasing token so there aren't rewards in the sense of rewards claim
    // These technically exist and are effectively accrued, but we're unable to derive them
    const rewardsAmountsCryptoBaseUnit = ['0'] as [string] | [string, string]

    const bip44Params = selectBIP44ParamsByAccountId(state, { accountId })

    if (!bip44Params) continue

    const withdrawInfo = await jinxyInvestor.getWithdrawInfo({
      contractAddress: opportunity.contractAddress,
      userAddress: fromAccountId(accountId).account,
      bip44Params,
    })

    const undelegations = [
      {
        completionTime: dayjs(withdrawInfo.releaseTime).unix(),
        undelegationAmountCryptoBaseUnit: bnOrZero(withdrawInfo.amount).toFixed(),
      },
    ]

    stakingOpportunitiesUserDataByUserStakingId[userStakingId] = {
      userStakingId,
      stakedAmountCryptoBaseUnit: balance,
      rewardsCryptoBaseUnit: { amounts: rewardsAmountsCryptoBaseUnit, claimable: true },
      undelegations,
    }
  }

  const data = {
    byId: stakingOpportunitiesUserDataByUserStakingId,
  }

  return Promise.resolve({ data })
}

export const jinxyStakingOpportunityIdsResolver = async (): Promise<{
  data: GetOpportunityIdsOutput
}> => {
  const opportunities = await getJinxyApi().getJinxyOpportunities()

  return {
    data: opportunities.map(opportunity => {
      const assetId = toOpportunityId({
        assetNamespace: 'erc20',
        assetReference: opportunity.contractAddress,
        chainId: ethChainId,
      })
      return assetId
    }),
  }
}
