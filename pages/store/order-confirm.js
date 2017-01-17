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
        selectedInvoiceInfo: {},
        memberInvoiceInfos: [],
        isInvoiceInfoPickContainerPopup: false,
        isWaitAddNewInvoiceInfo: false,
        invoiceInfoAnimationMaskClass: '',
        invoiceInfoAnimationContentClass: '',
        windowHeight: 627 - 45
    },
    //事件处理函数
    orderNow: function () {
        // check data validation
        var that = this;
        if (this.checkData()) {
            console.log('begin order create...');
            let order = that.data.order;
            console.log(order);
            app.getUserInfo((userInfo) => {
                order.tenantId = app.config[keys.CONFIG_SERVER].getTenantId()
                order.open_id = app.getSession().openid
                order.code = keys.SERVER_GEN
                order.appid = app.appid
                order.order_nickname = userInfo.nickName
                app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'order', order, (prepayRet) => {
                    var requestPaymentObject = prepayRet.requestPaymentObject
                    var orderId = prepayRet.orderId
                    requestPaymentObject['success'] = function (res) {
                        console.log('订单支付成功')
                        app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'orderPaySuccess/' + orderId, { pay_type: 'A0003' }, (ret) => {
                            app.toast.show('订单支付成功')
                            setTimeout(() => {
                                wx.redirectTo({
                                    url: './order-details?orderId=' + orderId
                                })
                            }, 700)
                        }, (ret) => {
                            app.toast.showError('支付状态更新失败')
                            setTimeout(() => {
                                wx.redirectTo({
                                    url: './order-details?orderId=' + orderId
                                })
                            }, 700)
                        });
                    }
                    requestPaymentObject['fail'] = function (res) {
                        console.log(res);
                        app.toast.showError('订单支付失败')
                        setTimeout(() => {
                            wx.redirectTo({
                                url: './order-details?orderId=' + orderId
                            })
                        }, 700)
                    }
                    console.log(requestPaymentObject);
                    wx.requestPayment(requestPaymentObject);
                }, { loadingText: '订单创建中...', toastInfo: '订单创建成功' });
            })
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
    openPickInvoiceInfoDialog: function () {
        var that = this;
        this.fetchMemberInvoiceInfos()
        this.setData({
            isInvoiceInfoPickContainerPopup: true,
            invoiceInfoAnimationContentClass: 'order-confirm-popup-container-content-fade-in'
        })
        setTimeout(() => {
            that.setData({
                invoiceInfoAnimationMaskClass: 'order-confirm-popup-container-mask-fade-in'
            })
        }, 300);
    },
    closePickInvoiceInfoDialog: function () {
        if (this.data.isInvoiceInfoPickContainerPopup) {
            var that = this;
            this.setData({
                invoiceInfoAnimationMaskClass: 'order-confirm-popup-container-mask-fade-out',
                invoiceInfoAnimationContentClass: 'order-confirm-popup-container-content-fade-out'
            })
            setTimeout(() => {
                that.setData({
                    isInvoiceInfoPickContainerPopup: false
                })
            }, 300);
        }
    },
    pickOkTap: function (e) {
        this.closePickInvoiceInfoDialog()
    },
    invoiceInfoTap: function (e) {
        let invoiceId = e.currentTarget.dataset.invoiceInfoId
        if (this.data.selectedInvoiceInfo && this.data.selectedInvoiceInfo._id == invoiceId)
            return;

        let memberInvoiceInfos = this.data.memberInvoiceInfos
        let invoiceInfo
        if (memberInvoiceInfos.find) {
            invoiceInfo = memberInvoiceInfos.find((o) => {
                return o._id == invoiceId
            });
        } else {
            for (let i = 0; i < memberInvoiceInfos.length; i++) {
                if (memberInvoiceInfos[i]._id == invoiceId) {
                    invoiceInfo = memberInvoiceInfos[i]
                    break
                }
            }
        }
        this.setData({
            selectedInvoiceInfo: invoiceInfo
        });
    },
    fetchMemberInvoiceInfos: function () {
        let that = this
        app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'invoices', { open_id: app.getSession().openid, tenantId: app.config[keys.CONFIG_SERVER].getTenantId(), page: { size: 99, skip: 0 } }, (memberInvoiceInfos) => {
            console.log(memberInvoiceInfos)
            that.setData({
                memberInvoiceInfos
            });
        })
    },
    fetchDefaultInvoiceInfo: function () {
        let that = this
        app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'getDefaultInvoice', { open_id: app.getSession().openid, tenantId: app.config[keys.CONFIG_SERVER].getTenantId() }, (defaultInvoice) => {
            that.setData({
                selectedInvoiceInfo: defaultInvoice
            });
        })
    },
    onLoad: function (options) {
        console.log('order-confirm onLoad')
        var that = this;
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
        this.fetchDefaultShippingInfo()
    }
})