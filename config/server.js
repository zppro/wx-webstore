const serverConfig = {
 root: 'https://sh.okertrip.com/me-services/',
 biz: 'mws/',
 wx:  'weixin/app/',
 tenantId: '5874d73a13155c6ec7546561'
}
const debugServerConfig = {
 root: 'http://192.168.255.107:3002/me-services/',
 biz: 'mws/',
 wx:  'weixin/app/',
 tenantId: ''
}
const debugServerConfig2 = {
 root: 'https://m.wx-api.com/me-services/',
 biz: 'mws/',
 wx:  'weixin/app/',
 tenantId: '5872df7f4a71cf1529c051d6'
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
        },
        getTenantId: function () {
            return this.config.tenantId;
        }
    };
}