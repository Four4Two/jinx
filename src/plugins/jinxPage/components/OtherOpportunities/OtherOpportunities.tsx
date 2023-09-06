import { Accordion, Card, CardHeader, Flex } from '@chakra-ui/react'
import type { OpportunitiesBucket } from 'plugins/jinxPage/JinxCommon'
import { useMemo } from 'react'
import { Text } from 'components/Text/Text'

import { JinxOtherOpportunityPanel } from './JinxOtherOpportunityPanel'

type OtherOpportunitiesProps = {
  title: string
  description: string
  opportunities: OpportunitiesBucket[]
}

export const OtherOpportunities: React.FC<OtherOpportunitiesProps> = ({
  title,
  description,
  opportunities,
}) => {
  const renderRows = useMemo(() => {
    return opportunities.map(opportunitiesBucket => {
      const { opportunities } = opportunitiesBucket
      if (!opportunities.length || opportunities.every(opportunity => opportunity.isDisabled))
        return null

      return (
        <JinxOtherOpportunityPanel
          key={opportunitiesBucket.type}
          opportunities={opportunities}
          title={opportunitiesBucket.title}
          type={opportunitiesBucket.type}
        />
      )
    })
  }, [opportunities])

  return (
    <Card display='block' width='full' borderRadius={8}>
      <CardHeader pb={0} mb={4}>
        <Flex flexDirection='row' alignItems='center' mb={2}>
          <Text translation={title} fontWeight='bold' color='inherit' />
        </Flex>
        <Text translation={description} color='text.subtle' />
      </CardHeader>
      <Accordion defaultIndex={[0]} allowToggle allowMultiple>
        {renderRows}
      </Accordion>
    </Card>
  )
}
