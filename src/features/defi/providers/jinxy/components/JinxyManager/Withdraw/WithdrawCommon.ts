import type { ChainId } from '@sudophunk/caip'
import type { WithdrawType } from '@shapeshiftoss/types'
import type { WithdrawValues } from 'features/defi/components/Withdraw/Withdraw'
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

type JinxyWithdrawValues = WithdrawValues &
  EstimatedGas & {
    txStatus: string
    usedGasFeeCryptoBaseUnit: string
    withdrawType: WithdrawType
  }

export type JinxyWithdrawState = {
  jinxyOpportunity: SupportedJinxyOpportunity
  approve: EstimatedGas
  withdraw: JinxyWithdrawValues
  loading: boolean
  txid: string | null
  jinxyFeePercentage: string
}
export enum JinxyWithdrawActionType {
  SET_OPPORTUNITY = 'SET_OPPORTUNITY',
  SET_WITHDRAW = 'SET_WITHDRAW',
  SET_APPROVE = 'SET_APPROVE',
  SET_LOADING = 'SET_LOADING',
  SET_TXID = 'SET_TXID',
  SET_TX_STATUS = 'SET_TX_STATUS',
  SET_JINXY_FEE = 'SET_JINXY_FEE',
}

type SetVaultAction = {
  type: JinxyWithdrawActionType.SET_OPPORTUNITY
  payload: SupportedJinxyOpportunity | null
}

type SetApprove = {
  type: JinxyWithdrawActionType.SET_APPROVE
  payload: EstimatedGas
}

type SetWithdraw = {
  type: JinxyWithdrawActionType.SET_WITHDRAW
  payload: Partial<JinxyWithdrawValues>
}

type SetLoading = {
  type: JinxyWithdrawActionType.SET_LOADING
  payload: boolean
}

type SetTxid = {
  type: JinxyWithdrawActionType.SET_TXID
  payload: string
}

type SetJinxyFee = {
  type: JinxyWithdrawActionType.SET_JINXY_FEE
  payload: string
}

export type JinxyWithdrawActions =
  | SetVaultAction
  | SetApprove
  | SetWithdraw
  | SetLoading
  | SetTxid
  | SetJinxyFee
