import keys from '../../config/keys.js'
//获取应用实例
var app = getApp()
Page({
    data: {
        orderItems: []
    },
    //事件处理函数

    onLoad: function (options) {
        console.log('order-item-list onLoad ');
        let that = this
        wx.getStorage({
            key: keys.STG_ORDER_CONFIRM_SHOW_ORDER_ITEMS,
            success: function (res) {
                // success
                that.setData({
                    orderItems: res.data,
                })
            },
            fail: function (err) {
                // fail
                console.log(err);
            }
        })

    }
})