//index.js
import keys from '../config/keys.js'
//获取应用实例
var app = getApp()
Page({
    data: {
        canTapToIndex: false,
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
    tapToIndex: function () {
        if (!this.data.canTapToIndex) {
            return
        }
        wx.switchTab({
            url: '/pages/store/index'
        });
    },
    fetchData: function (id) {
        let that = this
        app.libs.http.get(app.config[keys.CONFIG_SERVER].getBizUrl() + 'channelUnit/' + id, (channelUnit) => {
            let channelUnitData = { id: channelUnit.id, name: channelUnit.name }
            that.setData({ channelUnit: channelUnitData })
            console.log(channelUnitData)
            wx.setStorage({
                key: keys.CHANNEL_UNIT,
                data: channelUnitData,
                success: function (res) {
                    // success
                    console.log('渠道商入口设置成功')
                    wx.setNavigationBarTitle({
                        title: '正在进入' + channelUnit.name + '...'
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
                },
                complete: function () {
                    that.setData({ canTapToIndex: true })
                }
            })
        })
    },
    onLoad: function (options) {
        console.log('splash onLoad ')
        console.log(options)
        let that = this
        if (options.channelUnitId) {
            // 验证渠道单元并获取其名称
            this.fetchData(options.channelUnitId)
        }
    }
})