// https://eslint.org/docs/user-guide/configuring

module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: 'module',
    },
    env: {
        node: true,
        es6: true,
    },
    plugins: [],
    // add your custom rules here
    rules: {
        'no-debugger': ['error'],
        indent: ['warn', 4, { SwitchCase: 1 }],
        'linebreak-style': ['warn', 'unix'],
        quotes: ['off', 'single'],
        semi: ['warn', 'never'],
        'no-unused-vars': ['warn'],
        'no-undef': ['error'],
    },
}
