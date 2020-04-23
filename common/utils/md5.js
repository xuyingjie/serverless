const crypto = require('crypto')

// .toLowerCase()
// .toUpperCase()
function md5(str) {
    return crypto
        .createHash('md5')
        .update(str, 'utf8')
        .digest('hex')
}

module.exports = {
    md5,
}
