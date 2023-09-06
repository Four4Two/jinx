import { createContext } from 'react'

import type { JinxFarmingWithdrawActions, JinxFarmingWithdrawState } from './WithdrawCommon'

interface IWithdrawContext {
  state: JinxFarmingWithdrawState | null
  dispatch: React.Dispatch<JinxFarmingWithdrawActions> | null
}

export const WithdrawContext = createContext<IWithdrawContext>({ state: null, dispatch: null })
