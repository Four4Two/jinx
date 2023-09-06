import type { JinxFarmingWithdrawActions, JinxFarmingWithdrawState } from './WithdrawCommon'
import { JinxFarmingWithdrawActionType } from './WithdrawCommon'

export const initialState: JinxFarmingWithdrawState = {
  txid: null,
  loading: false,
  approve: {},
  withdraw: {
    lpAmount: '',
    fiatAmount: '',
    txStatus: 'pending',
    usedGasFeeCryptoPrecision: '',
    isExiting: false,
  },
}

export const reducer = (
  state: JinxFarmingWithdrawState,
  action: JinxFarmingWithdrawActions,
): JinxFarmingWithdrawState => {
  switch (action.type) {
    case JinxFarmingWithdrawActionType.SET_WITHDRAW:
      return { ...state, withdraw: { ...state.withdraw, ...action.payload } }
    case JinxFarmingWithdrawActionType.SET_LOADING:
      return { ...state, loading: action.payload }
    case JinxFarmingWithdrawActionType.SET_APPROVE:
      return { ...state, approve: action.payload }
    case JinxFarmingWithdrawActionType.SET_TXID:
      return { ...state, txid: action.payload }
    default:
      return state
  }
}
