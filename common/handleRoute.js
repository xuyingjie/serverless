
/**
 * 路由处理
 * @param {*} request 请求
 */
async function handleRoute(request, routeMap) {
    // 路由匹配
    const route = routeMap.find(item => request.path === item.path)
    if (!route) {
        return new Error('request path error.')
    }

    try {
        let body = request.body

        // "content-type":"application/json"
        const contentType = request.headers['content-type']
        if (contentType && contentType.match('json')) {
            body = body ? JSON.parse(body) : {}
        }

        // 登录验证
        if (route.auth || route.auth === undefined) {
            if (!body.openid || !body.token) {
                return new Error("openid and token can't be empty!")
            }
            // add checkToken
        }
        return await route.handle(body, request)
    } catch (e) {
        console.log(e)
        return new Error(e.message)
    }
}

module.exports = handleRoute
