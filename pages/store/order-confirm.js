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
        noneInvoice: { _id: 'none', title: '不开发票' },
        selectedInvoiceInfo: {},
        memberInvoiceInfos: [],
        isInvoiceInfoPickContainerPopup: false,
        isWaitAddNewInvoiceInfo: false,
        invoiceInfoAnimationMaskClass: '',
        invoiceInfoAnimationContentClass: '',
        windowHeight: 627 - 45
    },
    onShow: function () {
        console.log('on show isWaitAddNewInvoiceInfo: ' + this.data.isWaitAddNewInvoiceInfo);
        if (this.data.isWaitAddNewInvoiceInfo) {
            let that = this
            // this.fetchMemberInvoiceInfos()
            let memberInvoiceInfos = this.data.memberInvoiceInfos
            let order = this.data.order
            wx.getStorage({
                key: keys.STG_NEW_ADDED,
                success: function (res) {
                    // success
                    let invoiceInfo = res.data
                    console.log(res.data)
                    if (invoiceInfo) {
                        if (invoiceInfo.default_flag) {
                            //去除原来的default_flag
                            let oldDefaultInvoiceInfo
                            if (memberInvoiceInfos.find) {
                                oldDefaultInvoiceInfo = memberInvoiceInfos.find((o) => {
                                    return o.default_flag
                                });
                            } else {
                                for (let i = 0; i < memberInvoiceInfos.length; i++) {
                                    if (memberInvoiceInfos[i].default_flag) {
                                        oldDefaultInvoiceInfo = memberInvoiceInfos[i]
                                        break
                                    }
                                }
                            }
                            oldDefaultInvoiceInfo && (oldDefaultInvoiceInfo.default_flag = false)
                        }

                        memberInvoiceInfos.unshift(invoiceInfo)
                        order.invoice_flag = invoiceInfo._id != 'none'
                        if (order.invoice_flag) {
                            order.invoice_info = {
                                type: invoiceInfo.type,
                                title_type: invoiceInfo.title_type,
                                title: invoiceInfo.title
                            }
                        } else {
                            order.invoice_info = {}
                        }
                        that.setData({
                            order,
                            selectedInvoiceInfo: invoiceInfo,
                            memberInvoiceInfos,
                            isWaitAddNewInvoiceInfo: false
                        })
                    }
                },
                fail: function (err) {
                    // fail
                    console.log(err);
                },
                complete: function () {
                    wx.removeStorage({
                        key: keys.STG_NEW_ADDED
                    })
                }
            })
        }
    },
    //事件处理函数
    orderNow: function (e) {
        // check data validation
        var that = this;
        if (this.checkData()) {
            console.log('begin order create...');
            let order = that.data.order;
            console.log(order);
            app.getUserInfo((userInfo) => {
                order.tenantId = app.config[keys.CONFIG_SERVER].getTenantId()
                try {
                    let channelUnit = wx.getStorageSync(keys.STG_CHANNEL_UNIT)
                    if (channelUnit) {
                        order.channelUnitId = channelUnit.id
                    }
                } catch (e) {
                    // Do something when catch error
                    console.log('getStorageSync:STG_CHANNEL_UNIT')
                    console.log(e)
                }
                order.open_id = app.getSession().openid
                order.code = keys.SERVER_GEN
                order.appid = app.appid
                order.order_nickname = userInfo.nickName
                console.log(e.detail.formId)
                order.formId = e.detail.formId //saved for orderShipped

                app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'order', order, (prepayRet) => {
                    let requestPaymentObject = prepayRet.requestPaymentObject
                    console.log('requestPaymentObject:')
                    console.log(requestPaymentObject)
                    let orderId = prepayRet.orderId
                    let url = '../mine/order-details?orderId=' + orderId
                    let templateId = app.config[keys.CONFIG_SERVER].wxAppConfig.getTemplateId('OrderPayed')
                    requestPaymentObject['success'] = function (res) {
                        console.log('订单支付成功')
                        app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'orderPaySuccess/' + orderId, { pay_type: 'A0003' }, (ret) => {
                            console.log('orderPaySuccess:')
                            console.log(ret)
                            let sceneId = prepayRet.scene_id
                            app.requestAccessToken(function (accessToken) {
                                console.log('accessToken： ' + accessToken + ' templateId:  ' + templateId + ' sceneId:' + sceneId)

                                wx.request({
                                    url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + accessToken,
                                    data: {
                                        touser: ret.open_id,
                                        template_id: templateId,
                                        form_id: sceneId,
                                        data: {
                                            "keyword1": {
                                                "value": ret.code,
                                                "color": "#4a4a4a"
                                            },
                                            "keyword2": {
                                                "value": ret.items[0].spu_name,
                                                "color": "#9b9b9b"
                                            },
                                            "keyword3": {
                                                "value": '￥' + ret.amount + '元',
                                                "color": "#9b9b9b"
                                            },
                                            "keyword4": {
                                                "value": "如有疑问请致电88483380",
                                                "color": "#9b9b9b"
                                            }
                                        },
                                        color: '#ccc',
                                        emphasis_keyword: 'keyword1.DATA'
                                    },
                                    method: 'POST',
                                    success: function (res) {
                                        console.log("push msg");
                                        console.log(res);
                                    },
                                    fail: function (err) {
                                        // fail  
                                        console.log("push err")
                                        console.log(err);
                                    }
                                })
                            })

                            app.toast.show('订单支付成功')
                            wx.removeStorage({
                                key: keys.STG_ORDER_CONFIRM_NOW
                            })

                            // 从购物车清除当前订单SPU
                            let groupKey = order.shipping_info._id,
                                groupComparator = (groupItem) => { return groupItem.groupKey === groupKey }
                            for (let i = 0, length = order.items.length; i < length; i++) {
                                let spu_id = order.items[i].spu_id,
                                    sku_id = order.items[i].sku_id;
                                app.shoppingCart.removeItem(groupComparator, (item) => {
                                    return item.spu_id === spu_id && item.sku_id === sku_id
                                })
                            }

                            setTimeout(() => {
                                wx.redirectTo({
                                    url
                                })
                            }, 700)
                        }, (ret) => {
                            app.toast.showError('支付状态更新失败')
                            setTimeout(() => {
                                wx.redirectTo({
                                    url
                                })
                            }, 700)
                        });
                    }
                    requestPaymentObject['fail'] = function (res) {
                        console.log(res);
                        app.toast.showError('订单支付失败')
                        setTimeout(() => {
                            wx.redirectTo({
                                url
                            })
                        }, 700)
                    }
                    console.log(requestPaymentObject);
                    wx.requestPayment(requestPaymentObject);
                }, { loadingText: '订单创建中...' });
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
    addNewInvoiceInfo: function () {
        console.log('addNewInvoiceInfo...')
        this.setData({
            isWaitAddNewInvoiceInfo: true
        })
        wx.navigateTo({
            url: '../mine/invoice-details?needNavigationBack=true'
        })
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
        let order = this.data.order
        order.invoice_flag = invoiceInfo._id != 'none'
        if (order.invoice_flag) {
            order.invoice_info = {
                type: invoiceInfo.type,
                title_type: invoiceInfo.title_type,
                title: invoiceInfo.title
            }
        } else {
            order.invoice_info = {}
        }

        console.log(invoiceInfo)
        this.setData({
            order,
            selectedInvoiceInfo: invoiceInfo
        });
    },
    fetchMemberInvoiceInfos: function () {
        let that = this
        app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'invoices', { open_id: app.getSession().openid, tenantId: app.config[keys.CONFIG_SERVER].getTenantId(), page: { size: 99, skip: 0 } }, (memberInvoiceInfos) => {
            console.log(memberInvoiceInfos)
            memberInvoiceInfos.unshift(that.data.noneInvoice)
            that.setData({
                memberInvoiceInfos
            });
        })
    },
    fetchDefaultInvoiceInfo: function () {
        let that = this
        app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'getDefaultInvoice', { open_id: app.getSession().openid, tenantId: app.config[keys.CONFIG_SERVER].getTenantId() }, (defaultInvoice) => {
            let order = that.data.order
            order.invoice_flag = !!defaultInvoice
            if (order.invoice_flag) {
                order.invoice_info = {
                    type: defaultInvoice.type,
                    title_type: defaultInvoice.title_type,
                    title: defaultInvoice.title
                }
            } else {
                order.invoice_info = {}
            }
            console.log('fetchDefaultInvoiceInfo')
            console.log(order)
            that.setData({
                order,
                selectedInvoiceInfo: defaultInvoice || that.data.noneInvoice
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
            key: keys.STG_ORDER_CONFIRM_NOW,
            success: function (res) {
                // success
                let totalPay = (parseFloat(res.data.amount) + parseFloat(res.data.shipping_fee)).toFixed(2);
                that.setData({
                    order: res.data,
                    totalPay: totalPay
                })
                that.fetchDefaultInvoiceInfo()
            },
            fail: function (err) {
                // fail
                console.log(err);
            }
        })
    }
})