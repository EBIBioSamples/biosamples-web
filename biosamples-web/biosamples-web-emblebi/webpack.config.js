const path = require('path');
const plugins = require('../biosamples-web-core/webpack.plugins');
const inProduction = process.env.Node_ENV === 'production';

const srcRoot = './src/main/frontend';
const distRoot = './target/classes/static';


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
                use: plugins.extractSCSS.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                url: false,
                                minimize: inProduction
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {plugins: [plugins.autoprefixer]}
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
