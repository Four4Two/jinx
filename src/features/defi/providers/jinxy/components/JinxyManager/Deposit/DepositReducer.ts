import { KnownChainIds } from '@shapeshiftoss/types'
import { bn } from 'lib/bignumber/bignumber'
import { DefiType } from 'state/slices/opportunitiesSlice/types'

import type { JinxyDepositActions, JinxyDepositState } from './DepositCommon'
import { JinxyDepositActionType } from './DepositCommon'

export const initialState: JinxyDepositState = {
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
  pricePerShare: '',
  deposit: {
    fiatAmount: '',
    cryptoAmount: '',
    slippage: '',
    txStatus: 'pending',
    usedGasFeeCryptoBaseUnit: '',
  },
  isExactAllowance: false,
}

export const reducer = (state: JinxyDepositState, action: JinxyDepositActions) => {
  switch (action.type) {
    case JinxyDepositActionType.SET_OPPORTUNITY:
      return { ...state, jinxyOpportunity: { ...state.jinxyOpportunity, ...action.payload } }
    case JinxyDepositActionType.SET_APPROVE:
      return { ...state, approve: action.payload }
    case JinxyDepositActionType.SET_DEPOSIT:
      return { ...state, deposit: { ...state.deposit, ...action.payload } }
    case JinxyDepositActionType.SET_LOADING:
      return { ...state, loading: action.payload }
    case JinxyDepositActionType.SET_TXID:
      return { ...state, txid: action.payload }
    case JinxyDepositActionType.SET_IS_EXACT_ALLOWANCE:
      return { ...state, isExactAllowance: action.payload }
    default:
      return state
  }
}
