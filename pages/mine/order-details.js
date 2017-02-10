import keys from '../../config/keys.js'
//获取应用实例
var app = getApp()
Page({
    data: {
        current: {},
        formatShippingPhone: '',
        formatAmount: 0.00,
        formatShippingFee: 0.00,
        formatTotalFee: 0.00,
        formatCheckInTime: '',
        windowHeight: 627 - 45
    },
    //事件处理函数
    removeTap: function (e) {
        let that = this
        let orderId = this.data.current.id
        wx.showActionSheet({
            itemList: ['删除后无法恢复，继续？'],
            itemColor: '#f00',
            success: function (res) {
                if (res.tapIndex == 0) {
                    app.libs.http.delete(app.config[keys.CONFIG_SERVER].getBizUrl() + 'order/' + orderId, () => {
                        wx.setStorage({
                            key: keys.STG_ORDER_IS_CHANGED,
                            data: {
                                isOrderChanged: true
                            },
                            success: function (res) {
                                wx.navigateBack()
                            }
                        });
                    }, { loadingText: '订单删除中...', toastInfo: '订单删除成功' })
                }
            }
        })
    },
    applyForAfterSaleTap: function () {
        let orderId = this.data.current.id
        wx.navigateTo({
            url: '../mine/after-sale-details?orderId=' + orderId
        })
    },
    onLoad: function (options) {
        console.log('order-details onLoad on ' + options.orderId)
        var that = this;
        wx.getSystemInfo({
            success: function (ret) {
                that.setData({
                    windowHeight: ret.windowHeight - 45
                });
            }
        });
        app.toast.init(this);
        app.libs.http.get(app.config[keys.CONFIG_SERVER].getBizUrl() + 'order/' + options.orderId, (order) => {
            console.log(order);
            let formatShippingPhone = order.shipping_info.shipping_phone
            formatShippingPhone = formatShippingPhone.substr(0, 3) + '****' + formatShippingPhone.substr(7, 4);
            let formatAmount = order.amount.toFixed(2)
            let formatShippingFee = order.shipping_fee.toFixed(2)
            let formatTotalFee = (order.amount + order.shipping_fee).toFixed(2)
            let formatCheckInTime = app.libs.moment(order.check_in_time).format('YYYY-MM-DD HH:mm:ss')
            that.setData({
                current: order,
                formatShippingPhone,
                formatAmount,
                formatShippingFee,
                formatTotalFee,
                formatCheckInTime
            });

        });
    }
})