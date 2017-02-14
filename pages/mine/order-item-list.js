import keys from '../../config/keys.js'
import settings from '../../config/settings.js'
import quantityRegulator from '../../components/quantity-regulator/quantity-regulator'
//获取应用实例
var app = getApp();
// var  selectedAllStatus = false;
Page({
    data: {
        orderItems: []
    },
    //事件处理函数

    onLoad: function (options) {
        console.log('shopping-cart onLoad ');
         let orderItems = this.data.orderItems;
        wx.getStorage({
            key: keys.STG_ORDER_CONFIRM_NOW,
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