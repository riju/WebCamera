module.exports = {
  globDirectory: '.',
  globPatterns: [
    '**/*.{html,js,css,xml,woff2,webp,png}'
  ],
  swDest: 'sw.js',
  maximumFileSizeToCacheInBytes: 100 * 1024 * 1024,
};
