import { createContext } from 'react'

import type { JinxFarmingDepositActions, JinxFarmingDepositState } from './DepositCommon'

interface IDepositContext {
  state: JinxFarmingDepositState | null
  dispatch: React.Dispatch<JinxFarmingDepositActions> | null
}

export const DepositContext = createContext<IDepositContext>({ state: null, dispatch: null })
