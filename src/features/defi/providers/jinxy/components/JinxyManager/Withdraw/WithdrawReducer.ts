import { KnownChainIds, WithdrawType } from '@shapeshiftoss/types'
import { bn } from 'lib/bignumber/bignumber'
import { DefiType } from 'state/slices/opportunitiesSlice/types'

import type { JinxyWithdrawActions, JinxyWithdrawState } from './WithdrawCommon'
import { JinxyWithdrawActionType } from './WithdrawCommon'

export const initialState: JinxyWithdrawState = {
  txid: null,
  jinxyOpportunity: {
    contractAddress: '',
    stakingToken: '',
    provider: '',
    chain: KnownChainIds.EthereumMainnet,
    type: DefiType.Staking,
    expired: false,
    version: '',
    rewardToken: '',
    tvl: bn(0),
    apy: '',
  },
  loading: false,
  approve: {},
  withdraw: {
    fiatAmount: '',
    cryptoAmount: '',
    slippage: '',
    txStatus: 'pending',
    usedGasFeeCryptoBaseUnit: '',
    withdrawType: WithdrawType.DELAYED,
  },
  jinxyFeePercentage: '',
}

export const reducer = (state: JinxyWithdrawState, action: JinxyWithdrawActions) => {
  switch (action.type) {
    case JinxyWithdrawActionType.SET_OPPORTUNITY:
      return { ...state, jinxyOpportunity: { ...state.jinxyOpportunity, ...action.payload } }
    case JinxyWithdrawActionType.SET_APPROVE:
      return { ...state, approve: action.payload }
    case JinxyWithdrawActionType.SET_WITHDRAW:
      return { ...state, withdraw: { ...state.withdraw, ...action.payload } }
    case JinxyWithdrawActionType.SET_LOADING:
      return { ...state, loading: action.payload }
    case JinxyWithdrawActionType.SET_TXID:
      return { ...state, txid: action.payload }
    case JinxyWithdrawActionType.SET_JINXY_FEE:
      return { ...state, jinxyFeePercentage: action.payload }
    default:
      return state
  }
}
