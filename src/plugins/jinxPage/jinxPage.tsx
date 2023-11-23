import { ChevronDownIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Stack,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorModeValue,
  useMediaQuery,
} from '@chakra-ui/react'
import type { AssetId, ToAssetIdArgs } from '@sudophunk/caip'
import { ethChainId, jinxAssetId, jinxyAssetId } from '@sudophunk/caip'
import { supportsETH } from '@shapeshiftoss/hdwallet-core'
import qs from 'qs'
import { useCallback, useMemo } from 'react'
import { useTranslate } from 'react-polyglot'
import { useHistory, useLocation } from 'react-router'
import { AssetMarketData } from 'components/AssetHeader/AssetMarketData'
import { SEO } from 'components/Layout/Seo'
import { WalletActions } from 'context/WalletProvider/actions'
import { useRouteAssetId } from 'hooks/useRouteAssetId/useRouteAssetId'
import { useWallet } from 'hooks/useWallet/useWallet'
import { bn, bnOrZero } from 'lib/bignumber/bignumber'
import { jinxyAddresses } from 'lib/investor/investor-jinxy'
import { trackOpportunityEvent } from 'lib/mixpanel/helpers'
import { getMixPanel } from 'lib/mixpanel/mixPanelSingleton'
import { MixPanelEvents } from 'lib/mixpanel/types'
import { useGetJinxyAprQuery } from 'state/apis/jinxy/jinxyApi'
import { useGetAssetDescriptionQuery } from 'state/slices/assetsSlice/assetsSlice'
import { DefiProvider } from 'state/slices/opportunitiesSlice/types'
import { toOpportunityId } from 'state/slices/opportunitiesSlice/utils'
import {
  selectAggregatedEarnUserStakingOpportunityByStakingId,
  selectAssetById,
  selectAssets,
  selectPortfolioCryptoPrecisionBalanceByFilter,
  selectPortfolioUserCurrencyBalanceByAssetId,
  selectSelectedLocale,
} from 'state/slices/selectors'
import { useAppSelector } from 'state/store'
import { breakpoints } from 'theme/theme'

import { AssetActions } from './components/AssetActions'
import { BondProtocolCta } from './components/BondProtocolCta'
import { DappBack } from './components/DappBack'
import { Governance } from './components/Governance'
import { JinxChart } from './components/JinxChart'
import { JinxTab } from './components/JinxTab'
import { Layout } from './components/Layout'
import { MainOpportunity } from './components/MainOpportunity'
import { OtherOpportunities } from './components/OtherOpportunities/OtherOpportunities'
import { Total } from './components/Total'
import type { TradeOpportunitiesBucket } from './components/TradeOpportunities'
import { TradeOpportunities } from './components/TradeOpportunities'
import { useOtherOpportunities } from './hooks/useOtherOpportunities'
import { jinxTradeOpportunitiesBuckets, jinxyTradeOpportunitiesBuckets } from './JinxCommon'

export enum JinxPageRoutes {
  Jinx = '/jinx/jinx',
  Jinxy = '/jinx/jinxy',
}

const assetsRoutes: Record<AssetId, JinxPageRoutes> = {
  [jinxAssetId]: JinxPageRoutes.Jinx,
  [jinxyAssetId]: JinxPageRoutes.Jinxy,
}

const assetsTradeOpportunitiesBuckets: Record<AssetId, TradeOpportunitiesBucket[]> = {
  [jinxAssetId]: jinxTradeOpportunitiesBuckets,
  [jinxyAssetId]: jinxyTradeOpportunitiesBuckets,
}

export const JinxPage = () => {
  const {
    state: { wallet },
    dispatch,
  } = useWallet()
  const translate = useTranslate()
  const history = useHistory()
  const location = useLocation()
  const mixpanel = getMixPanel()

  const activeAssetId = useRouteAssetId()
  const allAssets = useAppSelector(selectAssets)
  // TODO(gomes): Use useRouteAssetId and selectAssetById programmatically
  const assetJinx = useAppSelector(state => selectAssetById(state, jinxAssetId))
  const assetJinxy = useAppSelector(state => selectAssetById(state, jinxyAssetId))
  if (!assetJinx) throw new Error(`Asset not found for AssetId ${jinxAssetId}`)
  if (!assetJinxy) throw new Error(`Asset not found for AssetId ${jinxyAssetId}`)

  const otherOpportunities = useOtherOpportunities(activeAssetId)

  const assets = useMemo(() => [assetJinx, assetJinxy], [assetJinx, assetJinxy])

  const selectedAssetIndex = useMemo(
    () => assets.findIndex(asset => asset?.assetId === activeAssetId),
    [activeAssetId, assets],
  )

  const selectedAsset = assets[selectedAssetIndex]

  const jinxFilter = useMemo(() => ({ assetId: jinxAssetId }), [])
  const jinxyFilter = useMemo(() => ({ assetId: jinxyAssetId }), [])
  const fiatBalanceJinx =
    useAppSelector(s => selectPortfolioUserCurrencyBalanceByAssetId(s, jinxFilter)) ?? '0'
  const fiatBalanceJinxy =
    useAppSelector(s => selectPortfolioUserCurrencyBalanceByAssetId(s, jinxyFilter)) ?? '0'
  const cryptoHumanBalanceJinx =
    useAppSelector(s => selectPortfolioCryptoPrecisionBalanceByFilter(s, jinxFilter)) ?? '0'
  const cryptoHumanBalanceJinxy =
    useAppSelector(s => selectPortfolioCryptoPrecisionBalanceByFilter(s, jinxyFilter)) ?? '0'

  const fiatBalances = useMemo(
    () => [fiatBalanceJinx, fiatBalanceJinxy],
    [fiatBalanceJinx, fiatBalanceJinxy],
  )

  const cryptoHumanBalances = useMemo(
    () => [cryptoHumanBalanceJinx, cryptoHumanBalanceJinxy],
    [cryptoHumanBalanceJinx, cryptoHumanBalanceJinxy],
  )

  const { data: jinxyAprData, isLoading: isJinxyAprLoading } = useGetJinxyAprQuery()

  const totalFiatBalance = bnOrZero(fiatBalanceJinx).plus(bnOrZero(fiatBalanceJinxy)).toString()

  const [isLargerThanMd] = useMediaQuery(`(min-width: ${breakpoints['md']})`, { ssr: false })
  const mobileTabBg = useColorModeValue('gray.100', 'gray.750')
  const description =
    selectedAsset.assetId === jinxAssetId
      ? translate('plugins.jinxPage.jinxDescription') // JINX has a custom description, other assets can use the asset-service one
      : selectedAsset.description

  const selectedLocale = useAppSelector(selectSelectedLocale)
  // TODO(gomes): Export a similar RTK select() query, consumed to determine wallet + staking balance loaded
  const getAssetDescriptionQuery = useGetAssetDescriptionQuery({
    assetId: selectedAsset.assetId,
    selectedLocale,
  })
  const isAssetDescriptionLoaded = !getAssetDescriptionQuery.isLoading

  const toAssetIdParts: ToAssetIdArgs = {
    assetNamespace: 'erc20',
    assetReference: jinxyAddresses[0].staking,
    chainId: ethChainId,
  }

  const opportunityId = toOpportunityId(toAssetIdParts)
  const opportunityDataFilter = useMemo(() => {
    return {
      stakingId: opportunityId,
    }
  }, [opportunityId])

  const jinxyEarnOpportunityData = useAppSelector(state =>
    opportunityDataFilter
      ? selectAggregatedEarnUserStakingOpportunityByStakingId(state, opportunityDataFilter)
      : undefined,
  )

  const handleTabClick = useCallback(
    (assetId: AssetId, assetName: string) => {
      if (assetId === activeAssetId) {
        return
      }
      mixpanel?.track(MixPanelEvents.Click, { element: `${assetName} toggle` })
      history.push(assetsRoutes[assetId])
    },
    [activeAssetId, history, mixpanel],
  )

  const handleOpportunityClick = useCallback(() => {
    if (!jinxyEarnOpportunityData) return
    if (!wallet || !supportsETH(wallet)) {
      dispatch({ type: WalletActions.SET_WALLET_MODAL, payload: true })
      return
    }

    trackOpportunityEvent(
      MixPanelEvents.ClickOpportunity,
      {
        opportunity: jinxyEarnOpportunityData,
        element: 'Jinx Page Row',
      },
      allAssets,
    )

    history.push({
      pathname: location.pathname,
      search: qs.stringify({
        provider: DefiProvider.BlackFury,
        chainId: assetJinxy.chainId,
        assetNamespace: 'erc20',
        contractAddress: jinxyAddresses[0].jinxy,
        assetReference: jinxyAddresses[0].staking,
        rewardId: jinxyAddresses[0].jinxy,
        modal: 'overview',
      }),
      state: { background: location },
    })
  }, [allAssets, assetJinxy.chainId, dispatch, jinxyEarnOpportunityData, history, location, wallet])

  if (!isAssetDescriptionLoaded || !activeAssetId) return null
  if (wallet && supportsETH(wallet) && !jinxyEarnOpportunityData) return null

  return (
    <Layout
      title={translate('plugins.jinxPage.jinxToken', {
        assetSymbol: selectedAsset.symbol,
      })}
      description={description ?? ''}
      icon={selectedAsset.icon}
    >
      <SEO
        title={translate('plugins.jinxPage.jinxToken', {
          assetSymbol: selectedAsset.symbol,
        })}
      />
      <Tabs variant='unstyled' index={selectedAssetIndex}>
        <TabList>
          <SimpleGrid
            gridTemplateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(3, 1fr)' }}
            gridGap={4}
            mb={4}
            width='full'
          >
            <Total fiatAmount={totalFiatBalance} icons={[assetJinx.icon, assetJinxy.icon]} />
            {isLargerThanMd &&
              assets.map((asset, index) => (
                <JinxTab
                  key={asset.assetId}
                  assetSymbol={asset.symbol}
                  assetIcon={asset.icon}
                  cryptoAmount={cryptoHumanBalances[index]}
                  fiatAmount={fiatBalances[index]}
                  onClick={() => handleTabClick(asset.assetId, asset.name)}
                />
              ))}
            {!isLargerThanMd && (
              <Box mb={4}>
                <Menu matchWidth>
                  <Box mx={{ base: 4, md: 0 }}>
                    <MenuButton
                      borderWidth='2px'
                      borderColor='primary'
                      height='auto'
                      as={Button}
                      rightIcon={<ChevronDownIcon />}
                      bg={mobileTabBg}
                      width='full'
                    >
                      {selectedAsset && (
                        <JinxTab
                          assetSymbol={selectedAsset.symbol}
                          assetIcon={selectedAsset.icon}
                          cryptoAmount={cryptoHumanBalances[selectedAssetIndex]}
                          fiatAmount={fiatBalances[selectedAssetIndex]}
                        />
                      )}
                    </MenuButton>
                  </Box>
                  <MenuList zIndex={3}>
                    {assets.map((asset, index) => (
                      <MenuItem
                        key={asset.assetId}
                        onClick={() => handleTabClick(asset.assetId, asset.name)}
                      >
                        <JinxTab
                          assetSymbol={asset.symbol}
                          assetIcon={asset.icon}
                          cryptoAmount={cryptoHumanBalances[index]}
                          fiatAmount={fiatBalances[index]}
                          as={Box}
                        />
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </Box>
            )}
          </SimpleGrid>
        </TabList>
        <TabPanels>
          <TabPanel p={0}>
            <Stack
              alignItems='flex-start'
              spacing={4}
              mx='auto'
              direction={{ base: 'column', xl: 'row' }}
            >
              <Stack spacing={4} flex='1 1 0%' width='full'>
                <MainOpportunity
                  assetId={selectedAsset.assetId}
                  apy={jinxyAprData?.jinxyApr ?? ''}
                  tvl={bnOrZero(jinxyEarnOpportunityData?.tvl).toString()}
                  isLoaded={Boolean(jinxyEarnOpportunityData && !isJinxyAprLoading)}
                  balance={bnOrZero(jinxyEarnOpportunityData?.cryptoAmountBaseUnit)
                    .div(bn(10).pow(assetJinxy.precision))
                    .toFixed()}
                  onClick={handleOpportunityClick}
                />

                <OtherOpportunities
                  title={`plugins.jinxPage.otherOpportunitiesTitle.${selectedAsset.symbol}`}
                  description={`plugins.jinxPage.otherOpportunitiesDescription.${selectedAsset.symbol}`}
                  opportunities={otherOpportunities}
                />
                <Governance />
              </Stack>
              <Stack flex='1 1 0%' width='full' maxWidth={{ base: 'full', lg: 'sm' }} spacing={4}>
                <AssetActions assetId={jinxAssetId} />
                <BondProtocolCta />
                <DappBack />
                <TradeOpportunities opportunities={assetsTradeOpportunitiesBuckets[jinxAssetId]} />
                <AssetMarketData assetId={selectedAsset.assetId} />
                <JinxChart assetId={jinxAssetId} />
              </Stack>
            </Stack>
          </TabPanel>
          <TabPanel p={0}>
            <Stack
              alignItems='flex-start'
              spacing={4}
              mx='auto'
              direction={{ base: 'column', xl: 'row' }}
            >
              <Stack spacing={4} flex='1 1 0%' width='full'>
                <OtherOpportunities
                  title={`plugins.jinxPage.otherOpportunitiesTitle.${selectedAsset.symbol}`}
                  description={`plugins.jinxPage.otherOpportunitiesDescription.${selectedAsset.symbol}`}
                  opportunities={otherOpportunities}
                />
              </Stack>
              <Stack flex='1 1 0%' width='full' maxWidth={{ base: 'full', lg: 'sm' }} spacing={4}>
                <AssetActions assetId={jinxyAssetId} />
                <DappBack />
                <TradeOpportunities opportunities={assetsTradeOpportunitiesBuckets[jinxyAssetId]} />
                <AssetMarketData assetId={selectedAsset.assetId} />
                <JinxChart assetId={jinxyAssetId} />
              </Stack>
            </Stack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>
  )
}
