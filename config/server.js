const serverConfig = {
 root: 'https://sh.okertrip.com/me-services/',
 biz: 'mws/',
 wx:  'weixin/app/'
}
const debugServerConfig = {
 root: 'http://192.168.255.107:3002/me-services/',
 biz: 'mws/',
 wx:  'weixin/app/'
}
const debugServerConfig2 = {
 root: 'https://m.wx-api.com/me-services/',
 biz: 'mws/',
 wx:  'weixin/app/'
}

module.exports = function(debug) {
    let config = debug ? debugServerConfig2 : serverConfig; 
    return {
        config,
        getBizUrl: function () {
            return this.config.root + this.config.biz;
        },
        getWXUrl: function () {
            return this.config.root + this.config.wx;
        }
    };
}