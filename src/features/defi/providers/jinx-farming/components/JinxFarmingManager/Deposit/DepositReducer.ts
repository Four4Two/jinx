import type { JinxFarmingDepositActions, JinxFarmingDepositState } from './DepositCommon'
import { JinxFarmingDepositActionType } from './DepositCommon'

export const initialState: JinxFarmingDepositState = {
  txid: null,
  loading: false,
  approve: {},
  deposit: {
    fiatAmount: '',
    cryptoAmount: '',
    txStatus: 'pending',
    usedGasFeeCryptoPrecision: '',
  },
}

export const reducer = (
  state: JinxFarmingDepositState,
  action: JinxFarmingDepositActions,
): JinxFarmingDepositState => {
  switch (action.type) {
    case JinxFarmingDepositActionType.SET_APPROVE:
      return { ...state, approve: action.payload }
    case JinxFarmingDepositActionType.SET_DEPOSIT:
      return { ...state, deposit: { ...state.deposit, ...action.payload } }
    case JinxFarmingDepositActionType.SET_LOADING:
      return { ...state, loading: action.payload }
    case JinxFarmingDepositActionType.SET_TXID:
      return { ...state, txid: action.payload }
    default:
      return state
  }
}
