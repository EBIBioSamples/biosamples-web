'use strict';

let webpack = require('webpack');
let CompressionPlugin = require('compression-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let Autoprefixer      = require('autoprefixer');
let defaults          = {
    gzip: {
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8
    },
    uglify: {
        mangle: false
    }
};

module.exports.gzip = (options = defaults.gzip) => new CompressionPlugin(options);

module.exports.uglify = (options = defaults.uglify) => new webpack.optimize.UglifyJsPlugin(options);

module.exports.extractSCSS = new ExtractTextPlugin('[name]');

module.exports.autoprefixer = (options = {}) => new Autoprefixer(options);

module.exports.hoisting = (options = {}) => new webpack.optimize.ModuleConcatenationPlugin(options);
