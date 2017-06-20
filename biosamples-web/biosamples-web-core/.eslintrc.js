module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
        commonjs: true
    },
    plugins: ["html"],
    globals: {
        "jQuery": true
    },
    extends: 'eslint:recommended',
    rules: {
        'linebreak-style': [ 'error', 'unix' ],
        quotes: ['error', 'single'],
        semi: [ 'error', 'always' ],
        'no-unused-vars': 'warn',
        'no-console': 'warn',
        'no-trailing-spaces': 'error',
        'semi-style': ['error', 'last'],
        'no-mixed-spaces-and-tabs': 'error',
        'indent': 'error',
        'no-var': 'error',
        'no-debugger': 0
    }
};
