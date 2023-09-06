import type { Contract } from '@ethersproject/contracts'
import { memoize } from 'lodash'
import { bnOrZero } from 'lib/bignumber/bignumber'

export const makeTotalLpApr = (jinxRewardRatePerToken: string, jinxEquivalentPerLPToken: string) =>
  bnOrZero(jinxRewardRatePerToken) // Jinx Rewards per second for 1 staked LP token
    .div(jinxEquivalentPerLPToken) // Equivalent JINX value for 1 LP token
    .times(100) // Decimal to percentage
    .times(3600) // 3600 seconds per hour
    .times(24) // 24 hours per day
    .times(365.25) // 365.25 days per year
    .decimalPlaces(4) // Arbitrary decimal cutoff
    .toString()

// Rate of JINX given per second for all staked addresses)
const getRewardsRate = memoize(
  async (farmingRewardsContract: Contract) => await farmingRewardsContract.rewardRate(),
)

const getTotalLpSupply = memoize(async (farmingRewardsContract: Contract) => {
  try {
    const totalSupply = await farmingRewardsContract.totalSupply()
    return bnOrZero(totalSupply.toString())
  } catch (error) {
    console.error(error)
    const errorMsg = 'totalLpSupply error'
    throw new Error(errorMsg)
  }
})

export const rewardRatePerToken = memoize(async (farmingRewardsContract: Contract) => {
  try {
    const rewardRate = await getRewardsRate(farmingRewardsContract)
    const totalSupply = await getTotalLpSupply(farmingRewardsContract)
    return bnOrZero(rewardRate.toString())
      .div(totalSupply)
      .times('1e+18')
      .decimalPlaces(0)
      .toString()
  } catch (error) {
    console.error(error)
    const errorMsg = 'rewardRatePerToken error'
    throw new Error(errorMsg)
  }
})
