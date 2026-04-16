import { debug, info, error as errorLog } from '@actions/core'
import { rmRF, mkdirP } from '@actions/io'
import { existsSync } from 'fs'
import { create } from '@actions/glob'
import { readFile, writeFile } from 'fs/promises'
import stripJsonComments from 'strip-json-comments'
import deepmerge from 'deepmerge'

export const cleanRemoteFiles = async ({
  recreate = false
}: { recreate?: boolean } = {}): Promise<void> => {
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
    if (recreate) {
      await mkdirP(remoteDir)
    }
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
