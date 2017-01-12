import keys from '../../config/keys.js'
//获取应用实例
var app = getApp()
Page({
    data: {
        current: {}
    },
    //事件处理函数
    onLoad: function (options) {
        console.log('order-details onLoad on ' + options.orderId)
        var that = this;
        app.toast.init(this);
        app.libs.http.get(app.config[keys.CONFIG_SERVER].getBizUrl() + 'order/' + options.orderId, (order) => {
            console.log(order);
            that.setData({
                current: order
            });
        });
    }
})