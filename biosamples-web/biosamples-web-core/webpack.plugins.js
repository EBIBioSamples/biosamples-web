let webpack = require("webpack");
let ExtractTextPlugin = require("extract-text-webpack-plugin");
let CompressionPlugin = require("compression-webpack-plugin");

module.exports.gzip = new CompressionPlugin({
	asset: "[path].gz[query]",
	algorithm: "gzip",
	test: /\.(js|css|html|svg)$/,
	threshold: 10240,
	minRatio: 0.8
});

module.exports.uglify = new webpack.optimize.UglifyJsPlugin({
	mangle: false
});
