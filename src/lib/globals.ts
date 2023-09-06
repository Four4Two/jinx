declare global {
  interface Window {
    isBlackFuryMobile: true | undefined
    ReactNativeWebView?: {
      postMessage: (msg: string) => void
    }
  }
}

export const isMobile = Boolean(window?.isBlackFuryMobile)
