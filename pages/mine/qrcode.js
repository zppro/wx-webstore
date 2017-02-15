import keys from '../../config/keys.js'
let app = getApp()
Page({
    data: {
        qrcode: ''
    },
    //事件处理函数
    onLoad: function () {
        console.log('qrcode onLoad')
        let that = this
        let qrcode = app.config[keys.CONFIG_SERVER].wxAppConfig.qrcode
        wx.getStorage({
            key: keys.STG_CHANNEL_UNIT,
            success: function (res) {
                if (res.data) {
                    qrcode = res.data.qrcode
                }
            },
            fail: function (err) {
                console.log(err);
            },
            complete: function () {
                that.setData({
                    qrcode
                })
            }
        })
    }
})