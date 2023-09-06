import { createContext } from 'react'

import type { JinxyWithdrawActions, JinxyWithdrawState } from './WithdrawCommon'

interface IWithdrawContext {
  state: JinxyWithdrawState | null
  dispatch: React.Dispatch<JinxyWithdrawActions> | null
}

export const WithdrawContext = createContext<IWithdrawContext>({ state: null, dispatch: null })
