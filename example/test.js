const handleRoute = require('../common/handleRoute')
const routeMap = require('./routes/index')
async function handle(path, body) {
    const request = {
        path,
        body: JSON.stringify(body),
        headers: {
            'content-type': 'application/json',
        },
    }
    const data = await handleRoute(request, routeMap)
    console.log(data)
    return data
}

const openidA = ''
const tokenA = ''

async function test() {
    await handle('/major-list', {
        openid: openidA,
        token: tokenA,
    })
}
test()
