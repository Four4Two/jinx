import type { Tx } from '../../../../../generated/highbury'
import { mempoolMock } from './mempoolMock'

const furyStandard: Tx = {
  txid: '0x6eb5d329b6d37dd3bd3bfb517d3d21c88f09f9fe77572b8ebe5730873cc12581',
  blockHash: '0xcee8f3c4a91d119d3d1c2dbe43dd18fa5ae4060d987ca9d2362e929f2caa4dfa',
  blockHeight: 41688283,
  timestamp: 1681858754,
  status: 1,
  from: '0xC070A61D043189D99bbf4baA58226bf0991c7b11',
  to: '0x7DE23FDA0C4243E9588CCe39819d53854965Ad77',
  confirmations: 5,
  value: '4079513530000000000',
  fee: '5618286173997000',
  gasLimit: '100000',
  gasUsed: '21000',
  gasPrice: '267537436857',
}

export default {
  tx: furyStandard,
  txMempool: mempoolMock(furyStandard),
}
