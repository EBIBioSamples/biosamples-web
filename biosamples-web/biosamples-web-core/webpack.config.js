let path = require('path');
let plugins = require('./webpack.plugins.js');

let srcRoot = './src/main/frontend';
let distRoot = './target/classes/static';
let inProduction = process.env.NODE_ENV === 'production';

// Plugin setups

let inProductionPlugin = [plugins.gzip, plugins.uglify];



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
                        loader: 'vue-loader'
                    },
                    {
                        loader: 'eslint-loader',
                        options: {
                            emitWarning: true
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        query: {
                            presets: ['es2015'] // Solve problem with Uglify https://github.com/joeeames/WebpackFundamentalsCourse/issues/3
                        }
                    },
                    {
                        loader: 'eslint-loader',
                        options: {
                            emitWarning: true
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
                use: plugins.extractSCSS.extract({
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
                            loader: 'postcss-loader',
                            options: { plugins: [ plugins.autoprefixer ] }
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
        plugins.extractSCSS,
    ]
};

if (inProduction) {
    // Add all the production plugin to the plugins object if in production
    module.exports.plugins.push(...inProductionPlugin);
}
