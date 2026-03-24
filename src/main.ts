import * as core from '@actions/core'
import {
  EXEC_OPTIONS,
  cleanRemoteFiles,
  getlocaleFilesFromCodeBaseAndRemote,
  updateJsonFilesInRemote
  // getNewTemplatesToRemote,
  // sendFilesWithPathToShopify,
  // syncLocaleAndSettingsJSON
} from './utils.js'
import { exec } from '@actions/exec'
import { info } from '@actions/core'

async function run(): Promise<void> {
  try {
    // REQUIRED INPUTS
    const store: string = core.getInput('store')
    const targetThemeId: string = core.getInput('theme')

    // Working Directory Input (optional)
    // Should be the root of the Shopify theme
    const workingDirectory: string = core.getInput('working-directory', {
      trimWhitespace: true
    })

    if (!!workingDirectory && workingDirectory !== '') {
      info(`Changing working directory to ${workingDirectory}`)
      process.chdir(workingDirectory)
    }

    await cleanRemoteFiles()

    info(`Pulling JSON files from theme ${targetThemeId}`)

    await exec(
      `shopify theme pull --only locales/*.json --theme "${targetThemeId}" --path remote --store ${store}`,
      [],
      EXEC_OPTIONS
    )

    const { remoteLocaleFiles, codeBaseLocaleFiles } =
      await getlocaleFilesFromCodeBaseAndRemote()

    await updateJsonFilesInRemote(
      codeBaseLocaleFiles,
      remoteLocaleFiles,
      `./remote/locales/`
    )

    info(`Pushing JSON files to theme ${targetThemeId}`)

    await exec(
      `shopify theme push --only locales/*.json --theme "${targetThemeId}" --path remote --store ${store}`,
      [],
      EXEC_OPTIONS
    )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  } finally {
    await cleanRemoteFiles()
  }
}

run()
