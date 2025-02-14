const fs = require('fs')
const path = require('path')
const {
  NOTION_TOKEN,
  // BLOG_INDEX_ID,
} = require('./src/lib/notion/server-constants')

try {
  fs.unlinkSync(path.resolve('.blog_index_data'))
} catch (_) {
  /* non fatal */
}
try {
  fs.unlinkSync(path.resolve('.blog_index_data_previews'))
} catch (_) {
  /* non fatal */
}

const warnOrError =
  process.env.NODE_ENV !== 'production'
    ? console.warn
    : (msg) => {
        throw new Error(msg)
      }

// if (!NOTION_TOKEN) {
//   // We aren't able to build or serve images from Notion without the
//   // NOTION_TOKEN being populated
//   warnOrError(
//     `\nNOTION_TOKEN is missing from env, this will result in an error\n` +
//       `Make sure to provide one before starting Next.js`
//   )
// }

// if (!BLOG_INDEX_ID) {
//   // We aren't able to build or serve images from Notion without the
//   // NOTION_TOKEN being populated
//   warnOrError(
//     `\nBLOG_INDEX_ID is missing from env, this will result in an error\n` +
//       `Make sure to provide one before starting Next.js`
//   )
// }

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
    // If you use `MDXProvider`, uncomment the following line.
    // providerImportSource: "@mdx-js/react",
  },
})

module.exports = withMDX({
  swcMinify: true,
  webpack(cfg, { dev, isServer }) {
    cfg.resolve.fallback = { fs: false }
    // only compile build-rss in production server build
    if (dev || !isServer) return cfg

    // we're in build mode so enable shared caching for Notion data
    process.env.USE_CACHE = 'true'

    const originalEntry = cfg.entry
    cfg.entry = async () => {
      const entries = { ...(await originalEntry()) }
      // entries['build-rss.js'] = './src/lib/build-rss.ts'
      return entries
    }
    return cfg
  },
})
