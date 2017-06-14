const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');
const inProduction = process.env.NODE_ENV === 'production';

const srcRoot = './src/main/frontend';
const distRoot = './target/classes/static';

const extractSCSS = new ExtractTextPlugin("[name]");

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
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: ['es2015'] // Solve problem with Uglify https://github.com/joeeames/WebpackFundamentalsCourse/issues/3
                }
            },
            {
                test: /\.html$/,
                loader: 'vue-html-loader'
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
    module.exports.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            mangle: false
        })
    )
}