const plugins = require('./webpack.plugins.js');

/**
 * Provide loader configuration for vue' single file
 * @param exclude
 * @param include
 * @returns {{module: {rules: [*]}}}
 */
module.exports.vue = ({exclude, include} = {}) => {
    return {
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    exclude,
                    include,
                    use:[
                        {
                            loader: 'vue-loader'
                        }
                    ]
                }
            ]
        }
    };
};

/**
 * Provide loader configuration for javascript file to use babel
 * @param exclude
 * @param include
 * @returns {{module: {rules: [*]}}}
 */
module.exports.babel = ({exclude, include} = {}) => {
    return {
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude,
                    include,
                    use: [
                        {
                            loader: 'babel-loader',
                            query: {
                                presets: ['es2015'], // Solve problem with Uglify https://github.com/joeeames/WebpackFundamentalsCourse/issues/3
                            }
                        }
                    ]
                }
            ]
        }
    };
};

/**
 * Provide loader configuration for requiring html in vue html files
 * @param exclude
 * @param include
 * @returns {{module: {rules: [*]}}}
 */
module.exports.vuehtml = ({exclude, include} = {}) => {
    return {
        module: {
            rules: [{
                test: /\.html$/,
                include,
                exclude,
                use: [
                    {
                        loader: 'vue-html-loader'
                    }
                ]
            }]
        }
    };
};

/**
 /**
 * Provide loader configuration for compiling sass files
 * apply autoprefix for browser compatibility
 * and extract css to separte file
 * @param exclude
 * @param include
 * @param useMinification
 * @returns {{module: {rules: [*]}}}
 */
module.exports.scss = ({exclude, include, useMinification} = {}) => {
    return {
        module: {
            rules: [{
                test: /\.s[ca]ss$/,
                exclude,
                include,
                use: plugins.extractSCSS.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader:'css-loader',
                            options: {
                                url: false,
                                minimize: useMinification
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
            }]
        },
        plugins: [plugins.extractSCSS],
    };
};

/**
 * Provide eslint configuration for linting vue and js files
 * @param exclude
 * @param include
 * @param options object with eslint loader options
 * @returns {{module: {rules: [*,*]}}}
 */
module.exports.eslint = ( {exclude, include, options} = {options: {emitWarning: true} } ) => {
    let loader = {
        loader: 'eslint-loader',
        options
    };

    return {
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude,
                    include,
                    use: [
                        loader
                    ]
                },
                {
                    test: /\.vue$/,
                    exclude,
                    include,
                    use: [
                        loader
                    ]

                }
            ]
        }
    };
};

/**
 * Custom plugins
 */
module.exports.plugins = plugins;

module.exports.plugins.production = () => {
    return {
        plugins: [ plugins.gzip, plugins.uglify ]
    };
};

module.exports.plugins.default = () => {
    return {
        plugins: [plugins.hoisting]
    };
};

