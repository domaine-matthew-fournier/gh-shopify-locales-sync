import { debug, info, error as errorLog } from '@actions/core'
import { rmRF, mkdirP } from '@actions/io'
import { existsSync } from 'fs'
import { create } from '@actions/glob'
import { readFile, writeFile } from 'fs/promises'
import stripJsonComments from 'strip-json-comments'
import deepmerge from 'deepmerge'

export const EXEC_OPTIONS = {
  listeners: {
    stdout: (data: Buffer) => {
      info(data.toString())
    },
    stderr: (data: Buffer) => {
      errorLog(data.toString())
    }
  }
}

export const cleanRemoteFiles = async (): Promise<void> => {
  const remoteDir = 'remote'

  if (!existsSync(remoteDir)) {
    debug(
      `Skipping cleanRemoteFiles: ${remoteDir} directory not found, creating it`
    )
    await mkdirP(remoteDir)
    return
  }

  try {
    await rmRF(remoteDir)
  } catch (error) {
    if (error instanceof Error) errorLog(error.message)
  }
}

export const fetchFiles = async (pattern: string): Promise<string[]> => {
  const globber = await create(pattern)
  const files = await globber.glob()
  return files
}

export const getlocaleFilesFromCodeBaseAndRemote = async (): Promise<{
  remoteLocaleFiles: string[]
  codeBaseLocaleFiles: string[]
}> => {
  const remoteLocaleFiles = await fetchFiles(`./remote/locales/*.json`)
  const codeBaseLocaleFiles = await fetchFiles(`./locales/*.json`)

  return {
    remoteLocaleFiles,
    codeBaseLocaleFiles
  }
}

export const updateJsonFilesInRemote = async (
  baseJsonFiles: string[],
  destinationJsonFiles: string[],
  destinationPath = `./remote/locales/`
) => {
  for (const baseFile of baseJsonFiles) {
    const baseFileName = baseFile.split('/').pop()

    const destinationFile = destinationJsonFiles.find(
      (file) => file.split('/').pop() === baseFileName
    )

    if (!destinationFile) {
      info(
        `No matching destination file found for ${baseFile}, creating new file at destination`
      )
      const destinationFilePath = `${destinationPath}${baseFileName}`
      const fileContent = await readFile(baseFile)
      await writeFile(destinationFilePath, fileContent)
      continue
    }

    const baseFileJson = await getCleanJsonFromFile(baseFile)
    const destinationJson = await getCleanJsonFromFile(destinationFile)
    const mergedJson = mergeJsonObjects(baseFileJson, destinationJson)
    await writeFile(destinationFile, JSON.stringify(mergedJson, null, 2))
    info(`Updated ${destinationFile} with merged content from ${baseFile}`)
  }
}

export const mergeJsonObjects = (baseJson: any, destinationJson: any) => {
  const mergedJson = deepmerge(baseJson, destinationJson, {
    arrayMerge: (_, sourceArray) => sourceArray
  })

  return mergedJson
}

export const getCleanJsonFromFile = async (fileToParse: string) => {
  try {
    const fileContent = await readFile(fileToParse, 'utf-8')
    const cleanedJsonString = stripJsonComments(fileContent).trim()
    return JSON.parse(cleanedJsonString)
  } catch (error) {
    if (error instanceof Error) {
      errorLog(`Error parsing JSON from file ${fileToParse}: ${error.message}`)
    }
    throw error
  }
}

// await fetchFiles(['./remote/locales/*.json']

//

// const fetchLocalFileForRemoteFile = async (
//   remoteFile: string
// ): Promise<string> => {
//   return remoteFile.replace('remote/', '')
// }

// Remove this from JSONString before parsing
// /*
// * ------------------------------------------------------------
// * IMPORTANT: The contents of this file are auto-generated.
// *
// * This file may be updated by the Shopify admin language editor
// * or related systems. Please exercise caution as any changes
// * made to this file may be overwritten.
// * ------------------------------------------------------------
// */

// const cleanJSONStringofShopifyComment = (
//   jsonString: string
// ): ShopifySettingsOrTemplateJSON => {
//   try {
//     const parsed = JSONParser(jsonString)
//     if (parsed && 'value' in parsed) {
//       return parsed.value as ShopifySettingsOrTemplateJSON
//     }

//     throw new Error('JSON Parse Error')
//   } catch (error) {
//     if (error instanceof Error) {
//       debug(error.message)
//     }
//     return JSON.parse(jsonString)
//   }
// }

// export const readJsonFile = async (
//   file: string
// ): Promise<ShopifySettingsOrTemplateJSON> => {
//   if (!existsSync(file)) {
//     return {} // Return empty object if file doesn't exist
//   }
//   const buffer = await readFile(file)
//   return cleanJSONStringofShopifyComment(buffer.toString())
// }

// export async function execShellCommand(cmd: string): Promise<string | Buffer> {
//   return new Promise((resolve, reject) => {
//     nativeExec(
//       cmd,
//       (error: ExecException | null, stdout: string, stderr: string) => {
//         if (error) {
//           return reject(error)
//         }
//         resolve(stdout ? stdout : stderr)
//       }
//     )
//   })
// }

// export const sendFilesWithPathToShopify = async (
//   files: string[],
//   {targetThemeId, store}: ISyncLocalJSONWithRemoteJSONForStore
// ): Promise<string[]> => {
//   for (const file of files) {
//     debug(`Pushing ${file} to Shopify`)
//   }
//   const pushOnlyCommand = files
//     .map(
//       file =>
//         `--only=${file.replace('./', '').replace(`${process.cwd()}/`, '')}`
//     )
//     .join(' ')
//   debug(`Push Only Command: ${pushOnlyCommand}`)
//   for (const file of files) {
//     const baseFile = file.replace(process.cwd(), '')
//     const destination = `${process.cwd()}/remote/new/${baseFile}`
//     debug(`Copying ${file} to ${destination}`)
//     copySync(file, destination, {
//       overwrite: true
//     })
//   }

//   await execShellCommand(
//     `shopify theme ${[
//       'push',
//       pushOnlyCommand,
//       `--theme "${targetThemeId}"`,
//       '--store',
//       store,
//       '--verbose',
//       '--path',
//       'remote/new',
//       '--nodelete'
//     ].join(' ')}`
//   )

//   return files
// }

// // Go throgh all keys in the object and a key which has disabled: true, remove it from the object
// export const removeDisabledKeys = (
//   obj: ShopifySettingsOrTemplateJSON
// ): ShopifySettingsOrTemplateJSON => {
//   const newObj = {...obj}
//   for (const key in obj) {
//     if (newObj[key]?.hasOwnProperty('disabled')) {
//       delete newObj[key]
//     }
//   }
//   return newObj
// }

// export const syncLocaleAndSettingsJSON = async (): Promise<string[]> => {
//   const remoteFiles = await fetchFiles(['./remote/locales/*.json'].join('\n'))

//   for (const remoteFile of remoteFiles) {
//     debug(`Remote File: ${remoteFile}`)
//   }
//   const localFilesToPush: string[] = []
//   for (const file of remoteFiles) {
//     try {
//       // Read JSON for Remote File
//       const remoteFile = await readJsonFile(file)
//       debug(`Remote File: ${file}`)

//       // Get Local Version of File Path
//       const localFileRef = await fetchLocalFileForRemoteFile(file)
//       debug(`Local File Ref: ${localFileRef}`)
//       // Read JSON for Local File
//       const localFile = await readJsonFile(localFileRef)

//       // Merge Local and Remote Files with Remote as Primary
//       const mergedFile = deepmerge(localFile, remoteFile, {
//         arrayMerge: (_, sourceArray) => sourceArray,
//         customMerge: key => {
//           if (key === 'blocks') {
//             return (_, newBlock) => {
//               return removeDisabledKeys(newBlock)
//             }
//           }
//         }
//       })

//       // Write Merged File to Local File
//       await writeFile(localFileRef, JSON.stringify(mergedFile, null, 2))
//       localFilesToPush.push(localFileRef)
//     } catch (error) {
//       if (error instanceof Error) {
//         debug('Error in syncLocaleAndSettingsJSON')
//         debug(error.message)
//       }
//       continue
//     }
//   }

//   return localFilesToPush
// }

// export const getNewTemplatesToRemote = async (): Promise<string[]> => {
//   const remoteTemplateFilesNames = (
//     (await fetchFiles('./remote/templates/**/*.json')) || []
//   ).map(file => file.replace('remote/', ''))

//   const localTemplateFiles = await fetchFiles('./templates/**/*.json')
//   const localeFilesToMove = localTemplateFiles.filter(
//     file => !remoteTemplateFilesNames.includes(file)
//   )

//   return localeFilesToMove
// }
