export interface Configs {
  doNotAddNewLocales: boolean
  allowPushToLiveTheme: boolean
}

export function getConfigs(configs: string[]): Configs {
  return {
    doNotAddNewLocales: configs.includes('do-not-add-new-locales'),
    allowPushToLiveTheme: configs.includes('allow-push-to-live-theme')
  }
}
