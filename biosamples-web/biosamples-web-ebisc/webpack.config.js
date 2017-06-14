const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');

const srcRoot = './src/main/frontend';
const distRoot = './target/classes/static';

const extractSCSS = new ExtractTextPlugin("[name]");

module.exports = {
    entry: {
        'stylesheets/style.css': path.resolve(__dirname, srcRoot, 'sass', 'style.scss')
    },
    output: {
        filename: '[name]',
        path: path.resolve(__dirname, distRoot)
    },
    module: {
        rules: [
            {
                test: /\.s[ca]ss$/,
                use: extractSCSS.extract({
                    fallback: 'style-loader',
                    use: ['raw-loader', 'sass-loader']
                })
            }
        ]
    },
    plugins: [
        extractSCSS
    ]
};