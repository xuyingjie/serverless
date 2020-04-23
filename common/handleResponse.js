// const zlib = require('zlib')

async function handleResponse(request, response, data) {
    let responseBody
    if (data instanceof Error) {
        // 记录有问题的请求
        // await logError()

        response.setStatusCode(400) //Bad Request
        response.setHeader('Content-type', 'text/plain; charset=UTF-8')
        responseBody = data.message
    } else {
        response.setStatusCode(200) //OK

        if (typeof data === 'string') {
            if (data.match('<xml>')) {
                response.setHeader('Content-type', 'text/xml; charset=UTF-8')
            } else {
                response.setHeader('Content-type', 'text/plain; charset=UTF-8')
            }
            responseBody = data
        } else if (typeof data === 'object' || typeof data === 'number') {
            response.setHeader('Content-type', 'application/json; charset=UTF-8')
            responseBody = JSON.stringify(data)
        }
    }
    response.send(responseBody)

    // zlib.gzip(data, (err, buffer) => {
    //     if (!err) {
    //         response.send(buffer)
    //     } else {
    //         // handle error
    //     }
    // })
}

module.exports = handleResponse
