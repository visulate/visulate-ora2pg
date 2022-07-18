function getCurrentTimestamp() {
    return process.env.TIMESTAMP_OVERRIDE || Date.now();
}
module.exports.getCurrentTimestamp = getCurrentTimestamp;