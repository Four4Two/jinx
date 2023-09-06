import { NativeAdapter } from '@shapeshiftoss/hdwallet-native'
import { JinxIcon } from 'components/Icons/JinxIcon'
import type { SupportedWalletInfo } from 'context/WalletProvider/config'

export const NativeConfig: Omit<SupportedWalletInfo, 'routes'> = {
  adapters: [NativeAdapter],
  supportsMobile: 'browser',
  icon: JinxIcon,
  name: 'BlackFury',
}
