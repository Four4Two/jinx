import { Button, Card, CardBody, CardHeader, Heading, Link } from '@chakra-ui/react'
import { useCallback } from 'react'
import { useTranslate } from 'react-polyglot'
import { Text } from 'components/Text'
import { useFeatureFlag } from 'hooks/useFeatureFlag/useFeatureFlag'
import { getMixPanel } from 'lib/mixpanel/mixPanelSingleton'
import { MixPanelEvents } from 'lib/mixpanel/types'

export const DappBack = () => {
  const translate = useTranslate()
  const isJinxBondCTAEnabled = useFeatureFlag('JinxBondCTA')

  const handleClick = useCallback(() => {
    getMixPanel()?.track(MixPanelEvents.Click, { element: 'Dappback Button' })
  }, [])
  if (!isJinxBondCTAEnabled) return null
  return (
    <Card>
      <CardHeader>
        <Heading as='h5'>
          <Text translation='plugins.jinxPage.dappBack.title' />
        </Heading>
      </CardHeader>
      <CardBody display='flex' gap={6} flexDirection='column'>
        <Text color='text.subtle' translation='plugins.jinxPage.dappBack.body' />
        <Button
          as={Link}
          href='https://dappback.com/blackfury'
          isExternal
          colorScheme='blue'
          onClick={handleClick}
        >
          {translate('plugins.jinxPage.dappBack.cta')}
        </Button>
      </CardBody>
    </Card>
  )
}
