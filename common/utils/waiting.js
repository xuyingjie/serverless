/**
 * 等待多少毫秒后
 * @param {} ms
 */
async function waiting(ms = 1000) {
    return new Promise(resolve => {
        setTimeout(function() {
            resolve()
        }, ms)
    })
}

module.exports = {
    waiting,
}
