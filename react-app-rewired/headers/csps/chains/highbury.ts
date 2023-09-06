import type { Csp } from '../../types'

export const csp: Csp = {
  'connect-src': [
    process.env.REACT_APP_HIGHBURY_NODE_URL!,
    process.env.REACT_APP_UNCHAINED_HIGHBURY_HTTP_URL!,
    process.env.REACT_APP_UNCHAINED_HIGHBURY_WS_URL!,
  ],
}
