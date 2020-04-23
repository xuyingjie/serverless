const fs = require('fs')
const path = require('path')
const FCClient = require('@alicloud/fc2')
const compressing = require('compressing')

const { accessKeyId, accessKeySecret, accountId, region, serviceName } = require('./common/constants/aliyun')

const client = new FCClient(accountId, {
    accessKeyID: accessKeyId,
    accessKeySecret,
    region,
})

const funcName = process.argv.pop()
const dir = path.resolve(__dirname, funcName)

async function handleUpdate() {
    try {
        await compressing.zip.compressDir(`${dir}/dist/index.js`, `${dir}/dist.zip`)

        const codeZip = fs.readFileSync(`${dir}/dist.zip`)
        const resp = await client.updateFunction(serviceName, funcName, {
            code: {
                zipFile: codeZip.toString('base64'),
            },
        })
        console.log('update function: %j', resp.data)
    } catch (err) {
        console.error(err)
    }
}
handleUpdate().then()
