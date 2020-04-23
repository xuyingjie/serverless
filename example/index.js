'use strict'

const getRawBody = require('raw-body')
const handleRoute = require('../common/handleRoute')
const handleResponse = require('../common/handleResponse')
const routeMap = require('./routes/index')

module.exports.handler = function(request, response, context) {
    /**
     * 文档
     * https://help.aliyun.com/document_detail/74757.html
     * https://help.aliyun.com/document_detail/52699.html
     * 
     Request 结构体
        headers：map 类型，存放来自 HTTP 客户端的键值对。
        path：string 类型，为 HTTP URL。
        queries：map 类型，存放来自 HTTP URL 中的 query 部分的 key - value 键值对, value 的类型可以为字符串或是数组。
        method：string 类型，HTTP 方法。
        clientIP：string 类型，client 的 IP 地址。
        url：string 类型，request 的 url。
     */

    getRawBody(request, async (err, body) => {
        request.body = body.toString()
        const data = await handleRoute(request, routeMap)
        await handleResponse(request, response, data)
    })
}
