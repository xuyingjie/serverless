/**
 * RAM
 */
const accessKeyId = ''
const accessKeySecret = ''
const accountId = ''

/**
 * 函数计算
 */
const region = ''
const serviceName = ''
const qualifier = 'LATEST' // LATEST, PROD
const endpoint = `https://${accountId}.${region}.fc.aliyuncs.com/2016-08-15/proxy/${serviceName}.${qualifier}`

/**
 * 表格存储
 */
const instanceName = ''

module.exports = {
    accessKeyId,
    accessKeySecret,
    accountId,
    
    region,
    serviceName,
    endpoint,

    instanceName,
}
