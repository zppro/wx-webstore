//index.js
import keys from '../config/keys.js'
//获取应用实例
var app = getApp()
Page({
    data: {
        progressWidth: 1,
        channelUnit: { id: null, name: '梧斯源' }
    },
    onShareAppMessage: function () {
        let desc = app.config[keys.CONFIG_SERVER].wxAppConfig.description || '销售睡眠仪，定位手环，机器人等'
        return {
            title: app.appname,
            desc,
            path: '/pages/splash'
        }
    },
    //事件处理函数
    tapTotal: function () {
        console.log(123)
        wx.switchTab({
            url: '/pages/store/index'
        });
    },
    onLoad: function (options) {
        console.log('splash onLoad ')
        let that = this
        if (options.channelUnitId) {
            let channelUnit = { id: options.channelUnitId, name: options.channelUnitName }
            this.setData({ channelUnit })
            wx.setStorage({
                key: keys.CHANNEL_UNIT,
                data: channelUnit,
                success: function (res) {
                    // success
                    console.log('渠道商入口设置成功')
                }
            });
        }
        wx.setNavigationBarTitle({
            title: '正在进入' + this.data.channelUnit.name + '...'
        })
        let internalId = setInterval(() => {
            let progressWidth = that.data.progressWidth;
            if (progressWidth === 100) {
                clearInterval(internalId)
                wx.switchTab({
                    url: '/pages/store/index'
                });
            } else {
                progressWidth += 1
                that.setData({ progressWidth })
            }

        }, 20)
    }
})