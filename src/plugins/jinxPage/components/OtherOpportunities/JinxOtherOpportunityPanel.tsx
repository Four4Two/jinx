import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { useTranslate } from 'react-polyglot'
import type { DefiType } from 'state/slices/opportunitiesSlice/types'

import type { ExternalOpportunity, OpportunityTypes } from '../../JinxCommon'
import { JinxOtherOpportunityPanelRow } from './JinxOtherOpportunityPanelRow'

type JinxOtherOpportunityPanelProps = {
  opportunities: ExternalOpportunity[]
  title: string
  type: OpportunityTypes | DefiType
}

export const JinxOtherOpportunityPanel: React.FC<JinxOtherOpportunityPanelProps> = ({
  opportunities,
  title,
}) => {
  const translate = useTranslate()
  const borderColor = useColorModeValue('gray.150', 'gray.700')

  const renderRows = useMemo(() => {
    return opportunities?.map((opportunity, index) => (
      <JinxOtherOpportunityPanelRow opportunity={opportunity} key={index} />
    ))
  }, [opportunities])

  return (
    <AccordionItem borderColor={borderColor} _last={{ borderBottomWidth: 0 }}>
      <AccordionButton px={6} py={4}>
        <Box flex='1' textAlign='left' fontWeight='semibold'>
          {translate(title)}
        </Box>
        <Flex>
          <Badge
            colorScheme='blue'
            display='flex'
            alignItems='center'
            px={2}
            py={'2px'}
            borderRadius='md'
            mr={4}
          >
            {opportunities.length}
          </Badge>
          <AccordionIcon color='text.subtle' />
        </Flex>
      </AccordionButton>
      <AccordionPanel pb={8} pt={5} px={2} my={-4}>
        {renderRows}
      </AccordionPanel>
    </AccordionItem>
  )
}
