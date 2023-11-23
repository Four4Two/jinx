import type { ChainId } from '@sudophunk/caip'
import type { ChainAdapter } from '@shapeshiftoss/chain-adapters'
import { highbury } from '@shapeshiftoss/chain-adapters'
import { KnownChainIds } from '@shapeshiftoss/types'
import * as unchained from '@shapeshiftoss/unchained-client'
import { getConfig } from 'config'
import { type Plugins } from 'plugins/types'

// I'm an unchained-client wrapper around `/api/v1/` endpoints
// If you ever need to consume endpoints which are not abstracted by chain-adapters, consume me
export const http = new unchained.highbury.V1Api(
  new unchained.highbury.Configuration({
    basePath: getConfig().REACT_APP_UNCHAINED_HIGHBURY_HTTP_URL,
  }),
)

// eslint-disable-next-line import/no-default-export
export default function register(): Plugins {
  return [
    [
      'highburyChainAdapter',
      {
        name: 'highburyChainAdapter',
        providers: {
          chainAdapters: [
            [
              KnownChainIds.HighburyMainnet,
              () => {
                const ws = new unchained.ws.Client<unchained.highbury.Tx>(
                  getConfig().REACT_APP_UNCHAINED_HIGHBURY_WS_URL,
                )

                return new highbury.ChainAdapter({
                  providers: { http, ws },
                  rpcUrl: getConfig().REACT_APP_HIGHBURY_NODE_URL,
                }) as unknown as ChainAdapter<ChainId> // FIXME: this is silly
              },
            ],
          ],
        },
      },
    ],
  ]
}
