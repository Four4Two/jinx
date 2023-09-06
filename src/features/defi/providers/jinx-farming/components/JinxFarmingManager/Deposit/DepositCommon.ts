type EstimatedGas = {
  estimatedGasCryptoPrecision?: string
}

type DepositValues = {
  fiatAmount: string
  cryptoAmount: string
}

type JinxFarmingDepositValues = DepositValues &
  EstimatedGas & {
    txStatus: string
    usedGasFeeCryptoPrecision: string
  }

export type JinxFarmingDepositState = {
  approve: EstimatedGas
  deposit: JinxFarmingDepositValues
  loading: boolean
  txid: string | null
}

export enum JinxFarmingDepositActionType {
  SET_APPROVE = 'SET_APPROVE',
  SET_DEPOSIT = 'SET_DEPOSIT',
  SET_LOADING = 'SET_LOADING',
  SET_TXID = 'SET_TXID',
}

type SetApprove = {
  type: JinxFarmingDepositActionType.SET_APPROVE
  payload: EstimatedGas
}

type SetDeposit = {
  type: JinxFarmingDepositActionType.SET_DEPOSIT
  payload: Partial<JinxFarmingDepositValues>
}

type SetLoading = {
  type: JinxFarmingDepositActionType.SET_LOADING
  payload: boolean
}

type SetTxid = {
  type: JinxFarmingDepositActionType.SET_TXID
  payload: string
}

export type JinxFarmingDepositActions = SetApprove | SetDeposit | SetLoading | SetTxid
