import type {
  DefiParams,
  DefiQueryParams,
} from 'features/defi/contexts/DefiManagerProvider/DefiCommon'
import { DefiAction } from 'features/defi/contexts/DefiManagerProvider/DefiCommon'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { SlideTransition } from 'components/SlideTransition'
import { useJinxEth } from 'context/JinxEthProvider/JinxEthProvider'
import { useBrowserRouter } from 'hooks/useBrowserRouter/useBrowserRouter'

import { Claim } from './Claim/Claim'
import { JinxFarmingDeposit } from './Deposit/JinxFarmingDeposit'
import { JinxFarmingOverview } from './Overview/JinxFarmingOverview'
import { JinxFarmingWithdraw } from './Withdraw/JinxFarmingWithdraw'

export const JinxFarmingManager = () => {
  const { query } = useBrowserRouter<DefiQueryParams, DefiParams>()
  const { modal } = query
  const { farmingAccountId, setFarmingAccountId: handleFarmingAccountIdChange } = useJinxEth()

  // farmingAccountId isn't a local state field - it is a memoized state field from the <JinxEthContext /> and will stay hanging
  // This makes sure to clear it on modal close
  useEffect(() => {
    return () => {
      handleFarmingAccountIdChange(undefined)
    }
  }, [handleFarmingAccountIdChange])

  return (
    <AnimatePresence exitBeforeEnter initial={false}>
      {modal === DefiAction.Overview && (
        <SlideTransition key={DefiAction.Overview}>
          <JinxFarmingOverview
            accountId={farmingAccountId}
            onAccountIdChange={handleFarmingAccountIdChange}
          />
        </SlideTransition>
      )}
      {modal === DefiAction.Deposit && (
        <SlideTransition key={DefiAction.Deposit}>
          <JinxFarmingDeposit
            accountId={farmingAccountId}
            onAccountIdChange={handleFarmingAccountIdChange}
          />
        </SlideTransition>
      )}
      {modal === DefiAction.Withdraw && (
        <SlideTransition key={DefiAction.Withdraw}>
          <JinxFarmingWithdraw
            accountId={farmingAccountId}
            onAccountIdChange={handleFarmingAccountIdChange}
          />
        </SlideTransition>
      )}
      {modal === DefiAction.Claim && (
        <SlideTransition key={DefiAction.Claim}>
          <Claim accountId={farmingAccountId} onAccountIdChange={handleFarmingAccountIdChange} />
        </SlideTransition>
      )}
    </AnimatePresence>
  )
}
