import { NativeAdapter } from '@shapeshiftoss/hdwallet-native'
import { JinxIcon } from 'components/Icons/JinxIcon'
import type { SupportedWalletInfo } from 'context/WalletProvider/config'

export const DemoConfig: Omit<SupportedWalletInfo, 'routes'> = {
  adapters: [NativeAdapter],
  supportsMobile: 'both',
  icon: JinxIcon,
  name: 'DemoWallet',
}
