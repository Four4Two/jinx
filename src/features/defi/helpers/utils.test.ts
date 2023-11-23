import { cosmosChainId, ethChainId } from '@sudophunk/caip'

import { chainIdToLabel } from './utils'

describe('chainIdToLabel', () => {
  it('can get label from chaintype', () => {
    let result = chainIdToLabel(cosmosChainId)
    expect(result).toEqual('Cosmos')

    result = chainIdToLabel(ethChainId)
    expect(result).toEqual('')
  })
})
