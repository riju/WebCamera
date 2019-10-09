import copy from 'rollup-plugin-copy-glob';
import createDefaultConfig from '@open-wc/building-rollup/modern-config';

let config = createDefaultConfig({
  input: './samples/camera/index.html',
  outputDir: 'docs/samples/camera'
});

function workbox(config) {
	return {
		name: 'workbox',
		async writeBundle() {
      let build = require('workbox-build');
      const { count, size } = await build.generateSW(config);
      console.log(count, size);
    }
	};
}

export default {
  ...config,
  plugins: [
    copy([
      { files: './samples/css/*.css', dest: 'docs/samples/css' },
      { files: './samples/camera/js/*.js', dest: 'docs/samples/camera/js' },
      { files: './utils/utils.js', dest: 'docs/utils' },
      { files: './samples/index.html', dest: 'docs/samples' },
    ], { verbose: true, watch: false }),
    ...config.plugins,
    workbox({
      globDirectory: "docs",
      globPatterns: [
        '**/*.{js,css,html,png,svg,json}'
      ],
      globIgnores: ['**/manifest.json'],
      swDest: "docs/samples/camera/sw.js",
    }),
  ],
};