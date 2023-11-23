import { ArrowForwardIcon } from '@chakra-ui/icons'
import { Box, Button, Card, CardBody, CardHeader, Heading, HStack } from '@chakra-ui/react'
import type { AccountId, AssetId } from '@sudophunk/caip'
import { fromAssetId, jinxAssetId, jinxyAssetId } from '@sudophunk/caip'
import qs from 'qs'
import { useEffect, useMemo } from 'react'
import { NavLink, useHistory, useLocation } from 'react-router-dom'
import { Text } from 'components/Text'
import { useJinxEth } from 'context/JinxEthProvider/JinxEthProvider'
import { WalletActions } from 'context/WalletProvider/actions'
import { useWallet } from 'hooks/useWallet/useWallet'
import type { EarnOpportunityType } from 'state/slices/opportunitiesSlice/types'
import { getMetadataForProvider } from 'state/slices/opportunitiesSlice/utils/getMetadataForProvider'
import {
  selectAggregatedEarnUserLpOpportunities,
  selectAggregatedEarnUserStakingOpportunitiesIncludeEmpty,
  selectAssetById,
} from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

import { StakingTable } from './StakingTable'

type EarnOpportunitiesProps = {
  tokenId?: string
  assetId: AssetId
  accountId?: AccountId
  isLoaded?: boolean
}

export const EarnOpportunities = ({ assetId, accountId }: EarnOpportunitiesProps) => {
  const history = useHistory()
  const location = useLocation()
  const {
    state: { isConnected },
    dispatch,
  } = useWallet()
  const asset = useAppSelector(state => selectAssetById(state, assetId))

  const stakingOpportunities = useAppSelector(
    selectAggregatedEarnUserStakingOpportunitiesIncludeEmpty,
  )

  const lpOpportunities = useAppSelector(selectAggregatedEarnUserLpOpportunities)

  const { setFarmingAccountId } = useJinxEth()

  useEffect(() => {
    if (accountId) {
      setFarmingAccountId(accountId)
    }
  }, [setFarmingAccountId, accountId])

  const allRows = useMemo(
    () =>
      !asset
        ? []
        : lpOpportunities.concat(stakingOpportunities).filter(
            row =>
              row.assetId.toLowerCase() === asset.assetId.toLowerCase() ||
              (row.underlyingAssetIds.length && row.underlyingAssetIds.includes(asset.assetId)) ||
              // show jinxy opportunity in the jinxy asset page
              (row.assetId === jinxAssetId && asset.assetId === jinxyAssetId),
          ),
    [asset, lpOpportunities, stakingOpportunities],
  )

  const handleClick = (opportunity: EarnOpportunityType) => {
    const { isReadOnly, type, provider, contractAddress, chainId, assetId, rewardAddress } =
      opportunity

    if (isReadOnly) {
      const url = getMetadataForProvider(opportunity.provider)?.url
      url && window.open(url, '_blank')
    }

    const { assetReference, assetNamespace } = fromAssetId(assetId)
    if (!isConnected) {
      dispatch({ type: WalletActions.SET_WALLET_MODAL, payload: true })
      return
    }

    history.push({
      pathname: location.pathname,
      search: qs.stringify({
        chainId,
        contractAddress,
        assetNamespace,
        assetReference,
        highestBalanceAccountAddress: opportunity.highestBalanceAccountAddress,
        rewardId: rewardAddress,
        provider,
        type,
        modal: 'overview',
      }),
      state: { background: location },
    })
  }

  if (!asset) return null
  if (allRows.length === 0) return null

  return (
    <Card variant='outline'>
      <CardHeader flexDir='row' display='flex'>
        <HStack gap={6} width='full'>
          <Box>
            <Heading as='h5'>
              <Text translation='navBar.defi' />
            </Heading>
            <Text color='text.subtle' translation='defi.earnBody' />
          </Box>
          <Box flex={1} textAlign='right'>
            <Button
              size='sm'
              variant='link'
              colorScheme='blue'
              ml='auto'
              as={NavLink}
              to='/earn'
              rightIcon={<ArrowForwardIcon />}
            >
              <Text translation='common.seeAll' />
            </Button>
          </Box>
        </HStack>
      </CardHeader>
      {Boolean(allRows?.length) && (
        <CardBody pt={0} px={2}>
          <StakingTable data={allRows} onClick={handleClick} />
        </CardBody>
      )}
    </Card>
  )
}
