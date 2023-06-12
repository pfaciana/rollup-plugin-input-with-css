import {normalizePath} from '@rollup/pluginutils';
import fs from 'fs';
import path from 'path';
import process from 'process';
import {deleteAsync} from 'del';

function replaceExtension(filePath, ext = '') {
	let parsed = path.parse(filePath);
	!ext ? '' : (ext.startsWith('.') ? ext : `.${ext}`);
	return path.join(parsed.dir, parsed.name + ext);
}

export default function inputWithCss() {
	let inputRefs = {};
	let outputRefs = {};

	function getOutputJs(outputCss, suffix = `.js`) {
		outputCss = normalizePath(path.resolve(outputCss));
		let outputJs = replaceExtension(outputCss, suffix);

		outputRefs[outputJs] = outputCss;

		return outputJs;
	}

	function createInputJs(inputCss, suffix = `.js`) {
		let inputJs = `${inputCss}${suffix}`;

		inputJs = normalizePath(path.resolve(inputJs));
		inputCss = normalizePath(path.resolve(inputCss));

		inputRefs[inputJs] = inputCss;
		const inputJsContent = `import './${path.basename(inputCss)}';`;

		if (!fs.existsSync(inputJs) || inputJsContent !== fs.readFileSync(inputJs, 'utf8')) {
			fs.writeFileSync(inputJs, inputJsContent);
		}

		return inputJs;
	}

	function getInputJs(input, suffix = `.js`) {
		if (Array.isArray(input)) {
			return input.map(item => createInputJs(item, suffix));
		}

		if (typeof input === 'object') {
			return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, createInputJs(value, suffix)]));
		}

		return createInputJs(input, suffix);
	}

	function cleanUp(code = 0) {
		Promise.all([deleteAsync(Object.keys(inputRefs))]).then(() => {
			process.exit(!isNaN(code) ? +code : 0);
		});
	}

	process.on('beforeExit', cleanUp);
	process.on('SIGINT', cleanUp);

	return {
		name: 'input-with-css',

		options(opts) {
			opts.input = getInputJs(opts.input, '.js');
			return opts;
		},

		outputOptions(outputOptions) {
			outputOptions.file && (outputOptions.file = getOutputJs(outputOptions.file));
			outputOptions.format ||= 'es';
			return outputOptions;
		},

		async closeBundle() {
			deleteAsync(Object.keys(outputRefs));
		},
	};
};