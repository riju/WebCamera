const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const { DEFAULT_EXTENSIONS } = require('@babel/core');
const { findSupportedBrowsers } = require('@open-wc/building-utils');
const customMinifyCss = require('@open-wc/building-utils/custom-minify-css');

const production = !process.env.ROLLUP_WATCH;

const plugins = [
  resolve(),

  // run code through babel
  babel({
    extensions: DEFAULT_EXTENSIONS,
    plugins: [
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-syntax-import-meta',
      // rollup rewrites import.meta.url, but makes them point to the file location after bundling
      // we want the location before bundling
      'bundled-import-meta',
      production && [
        'template-html-minifier',
        {
          modules: {
            'lit-html': ['html'],
            'lit-element': ['html', { name: 'css', encapsulation: 'style' }],
          },
          htmlMinifier: {
            collapseWhitespace: true,
            removeComments: true,
            caseSensitive: true,
            minifyCSS: customMinifyCss,
          },
        },
      ],
    ].filter(_ => !!_),

    presets: [
      [
        '@babel/preset-env',
        {
          targets: findSupportedBrowsers(),
          // preset-env compiles template literals for safari 12 due to a small bug which
          // doesn't affect most use cases. for example lit-html handles it: (https://github.com/Polymer/lit-html/issues/575)
          exclude: ['@babel/plugin-transform-template-literals'],
          useBuiltIns: false,
          modules: false,
        },
      ],
    ],
  })
];

const outputOptions = [
  {
    input: './elements/camera-capture/camera-capture.js',
    output: {
      file: './build/elements/camera-capture.js',
      sourcemap: true,
      format: 'esm',
      name: 'CameraCapture'
    },
    plugins
  },{
    input: './elements/demo-logger/demo-logger.js',
    output: {
      file: './build/elements/demo-logger.js',
      sourcemap: true,
      format: 'esm',
      name: 'CameraCapture'
    },
    plugins
  }
];

export default outputOptions;