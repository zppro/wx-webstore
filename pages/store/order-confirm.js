import quantityRegulator from '../../components/quantity-regulator/quantity-regulator'
import keys from '../../config/keys.js'
var app = getApp()
Page({
    data: {
        order: {
            amount: 0,
            items: [],
            shipping_info: {},
            shipping_fee: 0,
            invoice_info: {}
        },
        totalPay: 0.00,
        windowHeight: 627 - 45
    },
    //事件处理函数
    orderNow: function () {
        // check data validation
        var that = this;
        if (this.checkData()) {
            console.log('order create :');
            setTimeout(() => {
                let order = that.data.order;
                console.log(order);
                order.open_id = app.getSession().openid;
                order.code = keys.SERVER_GEN;
                app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'order', order, (orderRec) => {
                    console.log(orderRec);
                }, { loadingText: '订单创建中...', toastInfo: '订单创建成功' });
            }, 200);
        }
    },
    setInputData: function (e) {
        var fieldName = e.currentTarget.dataset.fieldName;
        var data = {};
        data[fieldName] = e.detail.value;
        this.setData(data);
        console.log(this.data);
    },
    checkData: function () {
        if (app.util.isEmpty(this.data.order.shipping_info.shipping_nickname)) {
            app.toast.showError('填写收货人');
            return false;
        }
        if (app.util.isEmpty(this.data.order.shipping_info.shipping_phone)) {
            app.toast.showError('填写收货人手机');
            return false;
        }
        if (!app.util.isPhone(this.data.order.shipping_info.shipping_phone)) {
            app.toast.showError('收货人手机格式错误');
            return false;
        }
        return true;
    },
    onLoad: function (options) {
        var that = this;
        console.log('order-confirm onLoad')
        wx.getSystemInfo({
            success: function (ret) {
                that.setData({
                    windowHeight: ret.windowHeight - 45
                });
            }
        });
        app.toast.init(this);
        wx.getStorage({
            key: keys.ORDER_CONFIRM_NOW,
            success: function (res) {
                // success
                let totalPay = (parseFloat(res.data.amount) + parseFloat(res.data.shipping_fee)).toFixed(2);
                that.setData({
                    order: res.data,
                    totalPay: totalPay
                });
            },
            fail: function (err) {
                // fail
                console.log(err);
            }
        })
    }
})