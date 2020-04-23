const crypto = require('crypto')

function sha(str, algorithm) {
    return crypto
        .createHash(algorithm)
        .update(str)
        .digest('hex')
}

function sha1(str) {
    return sha(str, 'sha1')
}

function sha256(str) {
    return sha(str, 'sha256')
}

module.exports = {
    sha1,
    sha256,
}
