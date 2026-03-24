import {
  fetchFiles,
  updateJsonFiles,
  mergeJsonObjects,
  getCleanJsonFromFile
} from '../src/utils'

describe('Fetch Files', () => {
  //  test('files should sync', async () => {
  //   const remotefiles = await fetchFiles(`./__tests__/testShopifyRoot/remote/locales/*.json`)
  //   const baseFiles = await fetchFiles(`./__tests__/testShopifyRoot/locales/*.json`)

  //   await updateJsonFiles(baseFiles, remotefiles, `./__tests__/testShopifyRoot/remote/locales/`)

  //   const updatedRemoteFiles = await fetchFiles(`./__tests__/testShopifyRoot/remote/locales/*.json`)
  //   const updatedRemoteFileNames = updatedRemoteFiles.map(file => file.split('/').pop())
  //   expect(updatedRemoteFileNames).toEqual(['en.default.json', 'es.json', 'fr.json'])
  //  })

  test('merge JSON objects', async () => {
    const baseFile = `./__tests__/testShopifyRoot/locales/en.default.json`
    const remotefile = `./__tests__/testShopifyRoot/remote/locales/en.default.json`

    const cleanBaseJson = await getCleanJsonFromFile(baseFile)
    const cleanRemoteJson = await getCleanJsonFromFile(remotefile)

    const mergedJson = await mergeJsonObjects(cleanBaseJson, cleanRemoteJson)

    expect(mergedJson).toEqual({
      general: {
        accessibility: {
          skip_to_content: 'Skip to content',
          collapse_content: 'Collapse content',
          expand_content: 'Expand content',
          close: 'Close',
          error: 'Error'
        },
        breadcrumbs: {
          back: 'Back',
          home: 'Home',
          history: 'History'
        }
      },
      shopify: {
        checkout: {
          marketing: {
            accept_sms_checkbox_label: 'Text me with updates on my order',
            sms: {
              disclaimer: {
                description_html: 'You agree to our terms',
                new_description_html: 'You agree to our terms'
              }
            }
          },
          order_summary: {
            discount_label: 'Discount Code!'
          }
        }
      }
    })
  })
})
