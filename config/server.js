const serverConfig = {
 root: 'http://sh.okertrip.com/wx-apps/webstore'
}
const debugServerConfig = {
 root: 'http://192.168.255.107:3002/wx-apps/webstore'
}
module.exports = function(debug) {
    return debug ? debugServerConfig : serverConfig
}