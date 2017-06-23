let path = require('path');
let merge = require('webpack-merge');
let parts = require('./webpack.parts.js');

let srcRoot = './src/main/frontend';
let distRoot = './target/classes/static';
let inProduction = process.env.NODE_ENV === 'production';
let useLint = process.env.LINT;
// Plugin setups

let PATHS = {
    input: {
        'javascript/init.js': path.resolve(__dirname, srcRoot, 'js', 'init.js'),
        'javascript/searchComponents.js': path.resolve(__dirname, srcRoot, 'js', 'searchComponents.js'),
        'javascript/samplesInGroup.js': path.resolve(__dirname, srcRoot, 'js', 'samplesInGroup.js'),
        'javascript/toolsFunctions.js': path.resolve(__dirname, srcRoot, 'js', 'toolsFunctions.js'),
        'javascript/biosamplesSampleLinks.js': path.resolve(__dirname, srcRoot, 'js', 'biosamplesSampleLinks.js'),
        'javascript/relationsVis.js': path.resolve(__dirname, srcRoot, 'js', 'relationsVis.js'),
        'stylesheets/base.css': path.resolve(__dirname, srcRoot, 'sass', 'base.scss')
    },
    output: {
        filename: '[name]',
        path: path.resolve(__dirname, distRoot)
    }
};

const commonConfig = {
    entry: PATHS.input,
    output: PATHS.output,
    module: {
        rules: [
            parts.vue(),
            parts.vuehtml(),
            parts.babel(),
            parts.scss({useMinifaction:inProduction}),
        ]
    },
    plugins: parts.plugins.default
};



module.exports = () => {
    let configuration = commonConfig;

    if (useLint) {
        configuration = merge([configuration, parts.eslint]);
    }
    if (inProduction) {
        configuration = merge([configuration, parts.plugins.production]);
    }
    // console.log(JSON.stringify(configuration));
    return configuration;
};
