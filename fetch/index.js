const getRawBody = require('raw-body')
const axios = require('axios')
const TOKEN = require('../common/constants/token')

async function init(request, response) {

    const { url, token } = request.queries
    if (!url || token !== TOKEN) {
        response.setStatusCode(400)
        response.send('no queries')
        return
    }

    getRawBody(request, async (err, body) => {
        try {
            delete request.headers['host']
            delete request.headers['origin']
            const conf = {
                url,
                method: request.method,
                headers: request.headers,
                data: body,
                responseType: 'arraybuffer',
            }

            const { status, headers, data } = await axios(conf)
            for (const key of Object.keys(headers)) {
                response.setHeader(key, headers[key])
            }
            response.setStatusCode(status)
            response.send(data)
        } catch (e) {
            response.setStatusCode(400)
            response.setHeader('Content-type', 'text/plain; charset=UTF-8')
            response.send(e.message)
        }
    })
}

module.exports.handler = function (request, response) {
    init(request, response)
}
