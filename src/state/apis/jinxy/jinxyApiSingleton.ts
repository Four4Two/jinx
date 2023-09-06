import type { EvmBaseAdapter } from '@shapeshiftoss/chain-adapters'
import { KnownChainIds } from '@shapeshiftoss/types'
import { getConfig } from 'config'
import { getChainAdapterManager } from 'context/PluginProvider/chainAdapterSingleton'
import { jinxyAddresses, JinxyApi } from 'lib/investor/investor-jinxy'

// don't export me, access me through the getter
let _jinxyApi: JinxyApi | undefined = undefined

// we need to be able to access this outside react
export const getJinxyApi = (): JinxyApi => {
  // Infura requests are origin restricted upstream to *.shapeshift.com
  // Using our own node locally allows JINXy development, though the balances aren't guaranteed to be accurate
  // since our archival node isn't fully synced yet
  const isLocalhost = window.location.hostname === 'localhost'
  const RPC_PROVIDER_ENV = isLocalhost
    ? 'REACT_APP_ETHEREUM_NODE_URL'
    : 'REACT_APP_ETHEREUM_INFURA_URL'

  if (_jinxyApi) return _jinxyApi

  const jinxyApi = new JinxyApi({
    adapter: getChainAdapterManager().get(
      KnownChainIds.EthereumMainnet,
    ) as unknown as EvmBaseAdapter<KnownChainIds.EthereumMainnet>,
    providerUrl: getConfig()[RPC_PROVIDER_ENV],
    jinxyAddresses,
  })

  _jinxyApi = jinxyApi

  return _jinxyApi
}
