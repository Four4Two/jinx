import { ExternalLinkIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Card,
  CardBody,
  Link,
  Skeleton,
  SkeletonText,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text as CText,
} from '@chakra-ui/react'
import type { AssetId } from '@shapeshiftoss/caip'
import { jinxAssetId } from '@shapeshiftoss/caip'
import { supportsETH } from '@shapeshiftoss/hdwallet-core/dist/wallet'
import isEqual from 'lodash/isEqual'
import qs from 'qs'
import { useCallback, useMemo } from 'react'
import { useTranslate } from 'react-polyglot'
import { useHistory, useLocation } from 'react-router'
import { AssetIcon } from 'components/AssetIcon'
import { MultiHopTrade } from 'components/MultiHopTrade/MultiHopTrade'
import { Text } from 'components/Text/Text'
import { WalletActions } from 'context/WalletProvider/actions'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'
import { jinxyAddresses } from 'lib/investor/investor-jinxy'
import { getMixPanel } from 'lib/mixpanel/mixPanelSingleton'
import { MixPanelEvents } from 'lib/mixpanel/types'
import { DefiProvider } from 'state/slices/opportunitiesSlice/types'
import { trimWithEndEllipsis } from 'state/slices/portfolioSlice/utils'
import { selectAccountIdsByAssetId, selectAssetById } from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

import { TrimmedDescriptionLength } from '../JinxCommon'

type JinxTabProps = {
  assetId: AssetId
}

const BuyJinxCoinbaseUrl = 'https://www.coinbase.com/price/jinx-token'
const TradeJinxyElasticSwapUrl = `https://elasticswap.org/#/swap`

export const AssetActions: React.FC<JinxTabProps> = ({ assetId }) => {
  const translate = useTranslate()
  const location = useLocation()
  const history = useHistory()
  const asset = useAppSelector(state => selectAssetById(state, assetId))
  if (!asset) throw new Error(`Asset not found for AssetId ${assetId}`)
  const { description } = asset || {}
  const trimmedDescription = trimWithEndEllipsis(description, TrimmedDescriptionLength)
  const isJinxAsset = assetId === jinxAssetId

  const filter = useMemo(() => ({ assetId }), [assetId])
  const accountIds = useAppSelector(state => selectAccountIdsByAssetId(state, filter), isEqual)
  const accountId = accountIds?.[0]

  const {
    state: { isConnected, isDemoWallet, wallet },
    dispatch,
  } = useWallet()
  const receive = useModal('receive')

  const walletSupportsETH = useMemo(() => Boolean(wallet && supportsETH(wallet)), [wallet])

  const handleWalletModalOpen = useCallback(
    () => dispatch({ type: WalletActions.SET_WALLET_MODAL, payload: true }),
    [dispatch],
  )
  const handleReceiveClick = useCallback(
    () =>
      !isDemoWallet && isConnected && walletSupportsETH
        ? receive.open({ asset, accountId })
        : handleWalletModalOpen(),
    [
      accountId,
      asset,
      handleWalletModalOpen,
      isConnected,
      isDemoWallet,
      receive,
      walletSupportsETH,
    ],
  )

  const receiveButtonTranslation = useMemo(
    () =>
      !isDemoWallet && walletSupportsETH ? 'plugins.jinxPage.receive' : 'common.connectWallet',
    [isDemoWallet, walletSupportsETH],
  )

  const onGetAssetClick = useCallback(() => {
    history.push({
      pathname: location.pathname,
      search: qs.stringify({
        provider: DefiProvider.BlackFury,
        chainId: asset.chainId,
        assetNamespace: 'erc20',
        contractAddress: jinxyAddresses[0].jinxy,
        assetReference: jinxyAddresses[0].staking,
        rewardId: jinxyAddresses[0].jinxy,
        modal: 'overview',
      }),
      state: { background: location },
    })
  }, [asset.chainId, history, location])

  return (
    <Card display='block' borderRadius={8}>
      <CardBody p={0}>
        <Tabs isFitted>
          <TabList>
            <Tab py={4} color='text.subtle' fontWeight='semibold'>
              {translate('plugins.jinxPage.getAsset', {
                assetSymbol: asset.symbol,
              })}
            </Tab>
            <Tab py={4} color='text.subtle' fontWeight='semibold'>
              {translate('plugins.jinxPage.trade')}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel textAlign='center' p={6}>
              <Box mb={6}>
                <AssetIcon src={asset.icon} boxSize='16' />
              </Box>
              <SkeletonText isLoaded={Boolean(description?.length)} noOfLines={3}>
                <CText color='text.subtle' mb={6}>
                  {trimmedDescription}
                </CText>
              </SkeletonText>
              <Stack width='full'>
                {!isJinxAsset && (
                  <Button onClick={onGetAssetClick} colorScheme={'blue'} mb={2} size='lg'>
                    <CText>
                      {translate('plugins.jinxPage.getAsset', {
                        assetSymbol: asset.symbol,
                      })}
                    </CText>
                  </Button>
                )}
                {isJinxAsset && (
                  <Button
                    colorScheme={'blue'}
                    mb={2}
                    size='lg'
                    as={Link}
                    leftIcon={<ExternalLinkIcon />}
                    href={BuyJinxCoinbaseUrl}
                    onClick={() =>
                      getMixPanel()?.track(MixPanelEvents.Click, { element: 'Coinbase Button' })
                    }
                    isExternal
                  >
                    <CText>
                      {translate('plugins.jinxPage.buyAssetOnCoinbase', {
                        assetSymbol: asset.symbol,
                      })}
                    </CText>
                  </Button>
                )}
                <Skeleton width='full' isLoaded={Boolean(wallet)}>
                  <Button onClick={handleReceiveClick} width='full' size='lg' colorScheme='gray'>
                    <Text translation={receiveButtonTranslation} />
                  </Button>
                </Skeleton>
              </Stack>
            </TabPanel>
            <TabPanel textAlign='center' p={0}>
              {isJinxAsset ? <MultiHopTrade defaultBuyAssetId={assetId} /> : null}
              {!isJinxAsset && (
                <Stack width='full' p={6}>
                  <SkeletonText isLoaded={Boolean(description?.length)} noOfLines={3}>
                    <CText color='text.subtle' mt={6} mb={6}>
                      {translate('plugins.jinxPage.tradingUnavailable', {
                        assetSymbol: asset.symbol,
                      })}
                    </CText>
                  </SkeletonText>
                  <Button
                    colorScheme={'blue'}
                    mb={6}
                    size='lg'
                    as={Link}
                    leftIcon={<ExternalLinkIcon />}
                    href={TradeJinxyElasticSwapUrl}
                    isExternal
                  >
                    <CText>
                      {translate('plugins.jinxPage.tradeOnElasticSwap', {
                        assetSymbol: asset.symbol,
                      })}
                    </CText>
                  </Button>
                </Stack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  )
}
