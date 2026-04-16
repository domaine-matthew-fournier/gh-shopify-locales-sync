gh-shopify-locales-sync
==============================

A GitHub Action to sync Shopify locales JSON from your repo to the target theme

Syncing Steps
--------

- Pulls target theme `locale` files to `/remote` directory
- Loops through all files in `/locales`
  - If remote version does not exist, copy as is to the `/remote` directory
  - If remote version does exist, merge JSON and update files in `/remote` directory
    - Remote JSON will take priority, only new keys from the local codebase will be added.
- Push `locale` files to the target theme from the `/remote` directory 

Usage
-----

### Basic Usage (Sync from Live Theme)

```source-yaml
 - uses: domaine-matthew-fournier/gh-shopify-locales-sync@v1.2.0
  if: ${{ inputs.sync_json }}
  with:
    store: '${{ env.SHOPIFY_FLAG_STORE }}'
    theme: '${{ inputs.target_theme_name }}'
```

Inputs
------

| Input | Required | Default | Description |
| --- | --- | --- | --- |
| `store` | Yes | - | The Shopify store URL or identifier |
| `theme` | Yes | - | Theme name or comma seperated list of theme IDs |
| `working-directory` | No | - | Working directory path if the action should run in a subdirectory |

Development
-----------

### Build

```source-shell
npm install
npm bundle
```

### Test

```source-shell
npm test
```

License
-------

MIT License - see [LICENSE](https://github.com/meetdomaine/shopify-jsons-sync/blob/main/LICENSE) file for details.
