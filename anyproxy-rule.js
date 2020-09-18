/**
 * 服务端通过海外函数计算节点请求内容：
 * 1. 配置 constants 常量
 * 2. 上传 fetch 函数到阿里云函数计算
 * 
 * 客户端通过 anyproxy 把请求转发到函数计算：
 * 1. npm i -g anyproxy
 * 2. anyproxy --intercept --rule anyproxy-rule.js
 * 3. 浏览器导入 anyproxy https证书，并代理指向本地 anyproxy 端口
 */

const { endpoint } = require('./common/constants/aliyun')
const TOKEN = require('./common/constants/token')

const url = new URL(`${endpoint}/fetch/`)

module.exports = {
    // 发送请求前拦截处理
    *beforeSendRequest(requestDetail) {
        const originUrl = encodeURIComponent(requestDetail.url)
        // const originHeaders = encodeURIComponent(JSON.stringify(requestDetail.requestOptions.headers))

        // console.log(requestDetail.requestOptions)
        requestDetail.protocol = url.protocol.slice(0, -1)
        requestDetail.requestOptions.hostname = url.hostname
        requestDetail.requestOptions.port = url.port
        requestDetail.requestOptions.path = `${url.pathname}?url=${originUrl}&token=${TOKEN}`
        requestDetail.requestOptions.headers.Host = url.host
        return requestDetail
    },
    *beforeSendResponse(requestDetail, responseDetail) {
        // console.log(responseDetail.response)
        responseDetail.response.header['Content-Disposition'] = 'inline'
        return responseDetail
    },
    *beforeDealHttpsRequest(requestDetail) {
        return true
    }
}
