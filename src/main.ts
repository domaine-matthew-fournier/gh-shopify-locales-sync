import * as core from '@actions/core'
import {
  cleanRemoteFiles,
  getlocaleFilesFromCodeBaseAndRemote,
  updateJsonFilesInRemote
} from './utils.js'
import { exec } from '@actions/exec'
import { info } from '@actions/core'

async function run(): Promise<void> {
  try {
    // REQUIRED INPUTS
    const store: string = core.getInput('store')
    const targetThemeIds: string[] = core
      .getInput('theme')
      .split(',')
      .map((id) => id.trim())

    // Working Directory Input (optional)
    // Should be the root of the Shopify theme
    const workingDirectory: string = core.getInput('working-directory', {
      trimWhitespace: true
    })

    if (!!workingDirectory && workingDirectory !== '') {
      info(`Changing working directory to ${workingDirectory}`)
      process.chdir(workingDirectory)
    }

    for (const targetThemeId of targetThemeIds) {
      const dashesForThemeId = targetThemeId.replace(/./g, '-')
      info(
        [
          `---------------------------------${dashesForThemeId}-`,
          `Updating Locales JSON for Theme "${targetThemeId}"`,
          `---------------------------------${dashesForThemeId}-`
        ].join('\n')
      )

      await cleanRemoteFiles()

      info(`Pulling JSON files from theme "${targetThemeId}"`)

      await exec(
        `shopify theme pull --only locales/*.json --theme "${targetThemeId}" --path remote --store ${store} --nodelete`
      )

      const { remoteLocaleFiles, codeBaseLocaleFiles } =
        await getlocaleFilesFromCodeBaseAndRemote()

      await updateJsonFilesInRemote(
        codeBaseLocaleFiles,
        remoteLocaleFiles,
        `./remote/locales/`
      )

      info(`Pushing JSON files to theme "${targetThemeId}"`)

      await exec(
        `shopify theme push --only locales/*.json --theme "${targetThemeId}" --path remote --store ${store} --nodelete`
      )
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  } finally {
    await cleanRemoteFiles()
  }
}

run()
