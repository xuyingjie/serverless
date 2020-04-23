/**
 * 参考 https://yq.aliyun.com/articles/701714 的模板代码
 */

const path = require('path')

module.exports = (env, argv) => {
    // 获取函数目录
    const lambdaDir = argv.define

    return {
        target: 'node',

        //'development' or 'production'
        mode: 'production',

        entry: `./${lambdaDir}/index.js`,

        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, lambdaDir, 'dist'),
            libraryTarget: 'umd',
        },

        // resolve: {
        //     alias: {
        //         '@base': path.resolve('base'),
        //     },
        // },

        // https://webpack.js.org/configuration/externals/
        externals: {
            tablestore: 'commonjs tablestore',
            // 'ali-oss': 'commonjs ali-oss', //函数计算环境里的sdk版本太老
            'raw-body': 'commonjs raw-body',
        },
    }
}
