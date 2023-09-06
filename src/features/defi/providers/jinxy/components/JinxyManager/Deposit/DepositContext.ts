import { createContext } from 'react'

import type { JinxyDepositActions, JinxyDepositState } from './DepositCommon'

export interface IDepositContext {
  state: JinxyDepositState | null
  dispatch: React.Dispatch<JinxyDepositActions> | null
}

export const DepositContext = createContext<IDepositContext>({ state: null, dispatch: null })
