type EstimatedGas = {
  estimatedGasCryptoPrecision?: string
}

type WithdrawValues = {
  lpAmount: string
  fiatAmount: string
}

type JinxFarmingWithdrawValues = WithdrawValues &
  EstimatedGas & {
    txStatus: string
    usedGasFeeCryptoPrecision: string
    isExiting: boolean
  }

export type JinxFarmingWithdrawState = {
  approve: EstimatedGas
  withdraw: JinxFarmingWithdrawValues
  loading: boolean
  txid: string | null
}

export enum JinxFarmingWithdrawActionType {
  SET_WITHDRAW = 'SET_WITHDRAW',
  SET_LOADING = 'SET_LOADING',
  SET_APPROVE = 'SET_APPROVE',
  SET_TXID = 'SET_TXID',
  SET_TX_STATUS = 'SET_TX_STATUS',
}

type SetWithdraw = {
  type: JinxFarmingWithdrawActionType.SET_WITHDRAW
  payload: Partial<JinxFarmingWithdrawValues>
}

type SetLoading = {
  type: JinxFarmingWithdrawActionType.SET_LOADING
  payload: boolean
}

type SetTxid = {
  type: JinxFarmingWithdrawActionType.SET_TXID
  payload: string
}

type SetApprove = {
  type: JinxFarmingWithdrawActionType.SET_APPROVE
  payload: EstimatedGas
}

export type JinxFarmingWithdrawActions = SetWithdraw | SetApprove | SetLoading | SetTxid
