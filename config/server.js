const serverConfig = {
 root: 'https://sh.okertrip.com/me-services/mws/'
}
const debugServerConfig = {
 root: 'http://192.168.255.107:3002/me-services/mws/'
}
const debugServerConfig2 = {
 root: 'https://m.wx-api.com/me-services/mws/'
}
module.exports = function(debug) {
    return debug ? debugServerConfig2 : serverConfig
}