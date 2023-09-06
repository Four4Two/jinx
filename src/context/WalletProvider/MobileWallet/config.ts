import { NativeAdapter } from '@shapeshiftoss/hdwallet-native'
import { JinxIcon } from 'components/Icons/JinxIcon'
import type { SupportedWalletInfo } from 'context/WalletProvider/config'

export const MobileConfig: Omit<SupportedWalletInfo, 'routes'> = {
  adapters: [NativeAdapter],
  supportsMobile: 'app',
  icon: JinxIcon,
  name: 'BlackFury Mobile',
}
