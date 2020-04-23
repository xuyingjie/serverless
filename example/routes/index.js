const login = require('./login')
const major = require('./major')

const routeMap = [
    // 登录
    { path: '/login', handle: login, auth: false },

    // major
    { path: '/major-list', handle: major.list },
]

module.exports = routeMap
