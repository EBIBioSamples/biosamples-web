var webpack = require('webpack');
var path = require('path');

var srcRoot = './src/main/frontend';
var distRoot = './target/classes/static';

module.exports = {
    entry: path.resolve(__dirname, srcRoot, 'js', 'init.js'),
    output: {
        filename: '[name].js',
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
                loader: "babel-loader"
            },
            {
                test: /\.html$/,
                loader: 'vue-html-loader'
            }
        ]
    }
};