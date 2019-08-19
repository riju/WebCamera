module.exports = {
  globDirectory: '.',
  globPatterns: [
    '**/*.{html,js,png,css,xml,woff2}'
  ],
  swDest: 'sw.js',
  maximumFileSizeToCacheInBytes: 100 * 1024 * 1024,
};
