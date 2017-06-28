const path = require('path');
const parts = require('../biosamples-web-core/webpack.parts');
const merge = require('webpack-merge');
const inProduction = process.env.Node_ENV === 'production';

const srcRoot = './src/main/frontend';
const distRoot = './target/classes/static';

let PATHS = {
    input: {
        'stylesheets/style.css': path.resolve(__dirname, srcRoot, 'sass', 'style.scss')    },
    output: {
        filename: '[name]',
        path: path.resolve(__dirname, distRoot)
    }
};

let ENTRIES = {
    entry: PATHS.input,
    output: PATHS.output,
};

let LOADERS = merge([
    parts.scss({useMinifaction:inProduction})
]);

let CONFIGURATION = merge(
    ENTRIES,
    LOADERS
);

module.exports = CONFIGURATION;

