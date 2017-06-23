'use strict';

let webpack = require('webpack');
let CompressionPlugin = require('compression-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let Autoprefixer      = require('autoprefixer');

module.exports.gzip = new CompressionPlugin({
    asset: '[path].gz[query]',
    algorithm: 'gzip',
    test: /\.(js|css|html|svg)$/,
    threshold: 10240,
    minRatio: 0.8
});

module.exports.uglify = new webpack.optimize.UglifyJsPlugin({
    mangle: false
});

module.exports.extractSCSS = new ExtractTextPlugin('[name]');

module.exports.autoprefixer = new Autoprefixer();

module.exports.hoisting = new webpack.optimize.ModuleConcatenationPlugin();
