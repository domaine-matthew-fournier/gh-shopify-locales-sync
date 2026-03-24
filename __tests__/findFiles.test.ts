import { fetchFiles } from '../src/utils'

describe('Fetch Files', () => {
  test('should fetch remote locale files', async () => {
    const filesToFetch = await fetchFiles(
      `./__tests__/testShopifyRoot/remote/locales/*.json`
    )
    const fileNames = filesToFetch.map((file) => file.split('/').pop())
    expect(fileNames).toEqual(['en.default.json', 'fr.json'])
  })

  test('should fetch codebase locale files', async () => {
    const filesToFetch = await fetchFiles(
      `./__tests__/testShopifyRoot/locales/*.json`
    )
    const fileNames = filesToFetch.map((file) => file.split('/').pop())
    expect(fileNames).toEqual(['en.default.json', 'es.json'])
  })
})
