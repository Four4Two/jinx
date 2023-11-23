import type { Csp } from '../../types'

export const csp: Csp = {
  'connect-src': [
    // markets.jinx.army is a coingecko proxy maintained by the jinx foundation
    'https://markets.jinx.army',
    // 'http://localhost:1137', needed when using local market proxy
  ],
  'img-src': ['https://assets.coingecko.com/coins/images/'],
}
