import type { ChainId } from '@shapeshiftoss/caip'
import type { DepositValues } from 'features/defi/components/Deposit/Deposit'
import type { BigNumber } from 'lib/bignumber/bignumber'
import type { DefiType } from 'state/slices/opportunitiesSlice/types'

type SupportedJinxyOpportunity = {
  type: DefiType
  provider: string
  version: string
  contractAddress: string
  rewardToken: string
  stakingToken: string
  chain: ChainId
  tvl: BigNumber
  apy: string
  expired: boolean
}

type EstimatedGas = {
  estimatedGasCryptoBaseUnit?: string
}

type JinxyDepositValues = DepositValues &
  EstimatedGas & {
    txStatus: string
    usedGasFeeCryptoBaseUnit: string
  }

export type JinxyDepositState = {
  jinxyOpportunity: SupportedJinxyOpportunity
  approve: EstimatedGas
  deposit: JinxyDepositValues
  loading: boolean
  pricePerShare: string
  txid: string | null
  isExactAllowance: boolean
}

export enum JinxyDepositActionType {
  SET_OPPORTUNITY = 'SET_OPPORTUNITY',
  SET_APPROVE = 'SET_APPROVE',
  SET_DEPOSIT = 'SET_DEPOSIT',
  SET_LOADING = 'SET_LOADING',
  SET_TXID = 'SET_TXID',
  SET_IS_EXACT_ALLOWANCE = 'SET_IS_EXACT_ALLOWANCE',
}

type SetJinxyOpportunitiesAction = {
  type: JinxyDepositActionType.SET_OPPORTUNITY
  payload: SupportedJinxyOpportunity | null
}

type SetApprove = {
  type: JinxyDepositActionType.SET_APPROVE
  payload: EstimatedGas
}

type SetDeposit = {
  type: JinxyDepositActionType.SET_DEPOSIT
  payload: Partial<JinxyDepositValues>
}

type SetLoading = {
  type: JinxyDepositActionType.SET_LOADING
  payload: boolean
}

type SetTxid = {
  type: JinxyDepositActionType.SET_TXID
  payload: string
}

type SetIsExactAllowance = {
  type: JinxyDepositActionType.SET_IS_EXACT_ALLOWANCE
  payload: boolean
}

export type JinxyDepositActions =
  | SetJinxyOpportunitiesAction
  | SetApprove
  | SetDeposit
  | SetLoading
  | SetTxid
  | SetIsExactAllowance
