import { fromAccountId, fromAssetId, jinxAssetId } from '@sudophunk/caip'
import type { MarketData } from '@shapeshiftoss/types'
import { ETH_JINX_POOL_CONTRACT_ADDRESS } from 'contracts/constants'
import { fetchUniV2PairData, getOrCreateContractByAddress } from 'contracts/contractManager'
import dayjs from 'dayjs'
import { bn, bnOrZero } from 'lib/bignumber/bignumber'
import { toBaseUnit } from 'lib/math'
import type { AssetsState } from 'state/slices/assetsSlice/assetsSlice'
import { selectMarketDataById } from 'state/slices/marketDataSlice/selectors'

import {
  assertIsJinxEthStakingContractAddress,
  jinxEthLpAssetId,
  jinxEthPair,
  jinxEthStakingIds,
  STAKING_ID_TO_VERSION,
} from '../../constants'
import type {
  GetOpportunityIdsOutput,
  GetOpportunityMetadataOutput,
  GetOpportunityUserStakingDataOutput,
} from '../../types'
import { DefiProvider, DefiType } from '../../types'
import { serializeUserStakingId } from '../../utils'
import type { OpportunityMetadataResolverInput, OpportunityUserDataResolverInput } from '../types'
import { makeTotalLpApr, rewardRatePerToken } from './utils'

export const ethJinxStakingMetadataResolver = async ({
  opportunityId,
  defiType,
  reduxApi,
}: OpportunityMetadataResolverInput): Promise<{
  data: GetOpportunityMetadataOutput
}> => {
  const { getState } = reduxApi
  const state: any = getState() // ReduxState causes circular dependency
  const assets: AssetsState = state.assets
  const lpAssetPrecision = assets.byId[jinxEthLpAssetId]?.precision ?? 0
  const lpTokenMarketData: MarketData = selectMarketDataById(state, jinxEthLpAssetId)
  const lpTokenPrice = lpTokenMarketData?.price

  const { assetReference: contractAddress } = fromAssetId(opportunityId)

  if (bnOrZero(lpTokenPrice).isZero()) {
    throw new Error(`Market data not ready for ${jinxEthLpAssetId}`)
  }

  assertIsJinxEthStakingContractAddress(contractAddress)
  const jinxFarmingContract = getOrCreateContractByAddress(contractAddress)
  const uniV2LPContract = getOrCreateContractByAddress(ETH_JINX_POOL_CONTRACT_ADDRESS)

  // tvl
  const totalSupply = await jinxFarmingContract.totalSupply()
  const tvl = bnOrZero(totalSupply.toString())
    .div(bn(10).pow(lpAssetPrecision))
    .times(lpTokenPrice)
    .toFixed(2)

  // apr
  const jinxRewardRatePerTokenV7 = await rewardRatePerToken(jinxFarmingContract)

  const pair = await fetchUniV2PairData(jinxEthLpAssetId)

  // Getting the ratio of the LP token for each asset
  const reserves = await uniV2LPContract.getReserves()
  const lpTotalSupply = (await uniV2LPContract.totalSupply()).toString()
  const jinxReserves = bnOrZero(bnOrZero(reserves[1].toString()).toString())
  const ethReserves = bnOrZero(bnOrZero(reserves[0].toString()).toString())
  const ethPoolRatio = ethReserves.div(lpTotalSupply).toString()
  const jinxPoolRatio = jinxReserves.div(lpTotalSupply).toString()

  const totalSupplyV2 = await uniV2LPContract.totalSupply()

  const token1PoolReservesEquivalent = bnOrZero(pair.reserve1.toFixed())
    .times(2) // Double to get equivalent of both sides of pool
    .times(bn(10).pow(pair.token1.decimals)) // convert to base unit value

  const jinxEquivalentPerLPToken = token1PoolReservesEquivalent
    .div(bnOrZero(totalSupplyV2.toString()))
    .times(bn(10).pow(pair.token1.decimals)) // convert to base unit value
    .toString()
  const apy = bnOrZero(makeTotalLpApr(jinxRewardRatePerTokenV7, jinxEquivalentPerLPToken))
    .div(100)
    .toString()

  const timeStamp = await jinxFarmingContract.periodFinish()
  const expired =
    timeStamp.toNumber() === 0 ? false : dayjs().isAfter(dayjs.unix(timeStamp.toNumber()))
  const version = STAKING_ID_TO_VERSION[opportunityId]

  const data = {
    byId: {
      [opportunityId]: {
        apy,
        assetId: opportunityId,
        id: opportunityId,
        provider: DefiProvider.EthJinxStaking,
        tvl,
        type: DefiType.Staking,
        underlyingAssetId: jinxEthLpAssetId,
        underlyingAssetIds: jinxEthPair,
        underlyingAssetRatiosBaseUnit: [
          toBaseUnit(ethPoolRatio.toString(), assets.byId[jinxEthPair[0]]?.precision ?? 0),
          toBaseUnit(jinxPoolRatio.toString(), assets.byId[jinxEthPair[1]]?.precision ?? 0),
        ] as const,
        expired,
        name: 'Jinx Farming',
        version,
        rewardAssetIds: [jinxAssetId] as const,
        isClaimableRewards: true,
      },
    },
    type: defiType,
  } as const

  return { data }
}

export const ethJinxStakingUserDataResolver = async ({
  opportunityId,
  accountId,
  reduxApi,
}: OpportunityUserDataResolverInput): Promise<{ data: GetOpportunityUserStakingDataOutput }> => {
  const { getState } = reduxApi
  const state: any = getState() // ReduxState causes circular dependency
  const lpTokenMarketData: MarketData = selectMarketDataById(state, jinxEthLpAssetId)
  const lpTokenPrice = lpTokenMarketData?.price

  const { assetReference: contractAddress } = fromAssetId(opportunityId)
  const { account: accountAddress } = fromAccountId(accountId)

  if (bnOrZero(lpTokenPrice).isZero()) {
    throw new Error(`Market data not ready for ${jinxEthLpAssetId}`)
  }

  assertIsJinxEthStakingContractAddress(contractAddress)

  const jinxFarmingContract = getOrCreateContractByAddress(contractAddress)

  const stakedBalance = await jinxFarmingContract.balanceOf(accountAddress)
  const earned = await jinxFarmingContract.earned(accountAddress)
  const stakedAmountCryptoBaseUnit = bnOrZero(stakedBalance.toString()).toString()
  const rewardsCryptoBaseUnit = { amounts: [earned.toString()] as [string], claimable: true }

  const userStakingId = serializeUserStakingId(accountId, opportunityId)

  const data = {
    byId: {
      [userStakingId]: {
        userStakingId,
        stakedAmountCryptoBaseUnit,
        rewardsCryptoBaseUnit,
      },
    },
    type: DefiType.Staking,
  }

  return { data }
}

export const ethJinxStakingOpportunityIdsResolver = (): Promise<{
  data: GetOpportunityIdsOutput
}> => Promise.resolve({ data: [...jinxEthStakingIds] })
