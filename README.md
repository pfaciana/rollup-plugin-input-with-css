# Input with CSS Rollup Plugin

This plugin allows users to use CSS or SCSS (Sass) files as inputs and output filenames in Rollup.js. Since Rollup.js primarily processes JavaScript files, this plugin helps bridge the gap by automatically generating temporary JavaScript input files that import the SCSS or CSS files. It also handles the deletion of the temporary JavaScript files when the bundle is complete.

## Installation

You can install the plugin via npm or Yarn:

```shell
npm install rollup-plugin-input-with-css --save-dev
```

or

```shell
yarn add rollup-plugin-input-with-css --dev
```

## Example Usage

```javascript
import postcss from 'rollup-plugin-postcss';
import postcssPresetEnv from 'postcss-preset-env';
import brotli from 'rollup-plugin-brotli';
import inputWithCss from 'rollup-plugin-input-with-css';

export default {
	input: 'css/src/styles.scss',
	output: [
		{file: 'css/dist/styles.css'},
		{file: 'css/dist/styles.min.css', plugins: [brotli({options: {level: 11}})]},
	],
	plugins: [
		inputWithCss(),
		postcss({
			use: ['sass'],
			extract: true,
			plugins: [
				postcssPresetEnv(),
			],
		}),
	],
};
```