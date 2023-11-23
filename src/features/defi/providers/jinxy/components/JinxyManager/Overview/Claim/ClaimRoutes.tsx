import type { AccountId } from '@sudophunk/caip'
import { useJinxyQuery } from 'features/defi/providers/jinxy/components/JinxyManager/useJinxyQuery'
import { AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'
import { Route, Switch, useLocation } from 'react-router'
import { SlideTransition } from 'components/SlideTransition'
import {
  makeTotalUndelegationsCryptoBaseUnit,
  serializeUserStakingId,
  supportsUndelegations,
  toOpportunityId,
} from 'state/slices/opportunitiesSlice/utils'
import { selectEarnUserStakingOpportunityByUserStakingId } from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

import { ClaimConfirm } from './ClaimConfirm'
import { ClaimStatus } from './ClaimStatus'

type ClaimRouteProps = {
  accountId: AccountId | undefined
  onBack: () => void
}

export const ClaimRoutes: React.FC<ClaimRouteProps> = ({ onBack, accountId }) => {
  const { contractAddress, stakingAssetId, chainId } = useJinxyQuery()

  const opportunityDataFilter = useMemo(() => {
    return {
      userStakingId: serializeUserStakingId(
        accountId ?? '',
        toOpportunityId({
          chainId,
          assetNamespace: 'erc20',
          assetReference: contractAddress,
        }),
      ),
    }
  }, [accountId, chainId, contractAddress])

  const jinxyEarnOpportunityData = useAppSelector(state =>
    opportunityDataFilter
      ? selectEarnUserStakingOpportunityByUserStakingId(state, opportunityDataFilter)
      : undefined,
  )

  const undelegationAmount = useMemo(
    () =>
      jinxyEarnOpportunityData && supportsUndelegations(jinxyEarnOpportunityData)
        ? makeTotalUndelegationsCryptoBaseUnit(jinxyEarnOpportunityData.undelegations).toFixed()
        : '0',
    [jinxyEarnOpportunityData],
  )

  const location = useLocation()

  return (
    <SlideTransition>
      <AnimatePresence exitBeforeEnter initial={false}>
        <Switch location={location} key={location.key}>
          <Route exact path='/'>
            <ClaimConfirm
              stakingAssetId={stakingAssetId}
              accountId={accountId}
              chainId={chainId}
              contractAddress={contractAddress}
              onBack={onBack}
              amount={undelegationAmount}
            />
          </Route>
          <Route exact path='/status'>
            <ClaimStatus accountId={accountId} />
          </Route>
        </Switch>
      </AnimatePresence>
    </SlideTransition>
  )
}
