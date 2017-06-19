let webpack = require('webpack');
let ExtractTextPlugin = require("extract-text-webpack-plugin");
let CompressionPlugin = require("compression-webpack-plugin");
let path = require('path');
let prodPlugins = require('./webpack.plugins.js');

let srcRoot = './src/main/frontend';
let distRoot = './target/classes/static';
let inProduction = process.env.NODE_ENV === 'production';

// Plugin setups
let extractSCSS = new ExtractTextPlugin("[name]");

let inProductionPlugin = [prodPlugins.gzip, prodPlugins.uglify];

module.exports = {
    entry: {
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
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                enforce: 'pre',
                use: [
                    {
                        loader: 'eslint-loader',
                        options: {
                            emitWarning: true
                        }
                    },
                    {
                        loader: 'vue-loader'
                    }
                ]
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'eslint-loader',
                        options: {
                            emitWarning: true
                        }
                    },
                    {
                        loader: 'babel-loader',
                        query: {
                            presets: ['es2015'] // Solve problem with Uglify https://github.com/joeeames/WebpackFundamentalsCourse/issues/3
                        }
                    }
                ]
            },
            {
                test: /\.html$/,
                use: 'vue-html-loader'
            },
            {
                test: /\.s[ca]ss$/,
                use: extractSCSS.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader:'css-loader',
                            options: {
                                url: false,
                                minimize: inProduction
                            }
                        },
                        {
                            loader: 'sass-loader'
                        }
                    ]
                })
            }
        ]
    },
    plugins: [
        extractSCSS,
    ]
};

if (inProduction) {
    // Add all the production plugin to the plugins object if in production
    module.exports.plugins.push(...inProductionPlugin);
}
