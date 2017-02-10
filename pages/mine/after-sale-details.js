import keys from '../../config/keys.js'
//获取应用实例
var app = getApp()
Page({
    data: {
        current: {},
        selectedTypeInfo: {},
        afterSaleTypeInfos: [
            { _id: 'A0001', type: '申请维修' },
            { _id: 'A0003', type: '我要换货' },
            { _id: 'A0005', type: '我要退货' },
            { _id: 'A0007', type: '我要退款' }
        ]
    },
    //事件处理函数
    applyForOrderAfterSaleTap: function () {
        var that = this;
        setTimeout(() => {
            if (that.checkData()) {
                let current = that.data.current;
                wx.showActionSheet({
                    itemList: ['确定要提交售后申请么？'],
                    itemColor: '#f00',
                    success: function (res) {
                        if (res.tapIndex == 0) {
                            app.getUserInfo((userInfo) => {
                                if (!current.id) {
                                    current.code = keys.SERVER_GEN
                                    current.open_id = app.getSession().openid
                                    current.tenantId = app.config[keys.CONFIG_SERVER].getTenantId()
                                    try {
                                        let channelUnit = wx.getStorageSync(keys.STG_CHANNEL_UNIT)
                                        if (channelUnit) {
                                            current.channelUnitId = channelUnit.id
                                        }
                                    } catch (e) {
                                        // Do something when catch error
                                        console.log('getStorageSync:STG_CHANNEL_UNIT')
                                        console.log(e)
                                    }
                                    current.apply_for_nickname = userInfo.nickName
                                }
                                app.libs.http.save(app.config[keys.CONFIG_SERVER].getBizUrl() + 'afterSale', current, () => {
                                    // wx.navigateBack()
                                    wx.redirectTo({
                                        url: './order-list'
                                    })

                                }, { loadingText: '提交申请中...', toastInfo: '提交申请成功' })
                            })
                        }
                    }
                })
            }
        }, 500)
    },
    //提交判断
    checkData: function () {
        if (app.util.isEmpty(this.data.current.type)) {
            app.toast.showError('选择售后类型');
            return false
        }
        if (app.util.isEmpty(this.data.current.memo)) {
            app.toast.showError('填写申请售后说明');
            return false
        }
        return true
    },
    setInputData: function (e) {
        var fieldName = e.currentTarget.dataset.fieldName;
        var data = {}
        data[fieldName] = e.detail.value
        this.setData(data)
        console.log(this.data.current)
    },
    typeInfoTap: function (e) {
        if (this.data.selectedTypeInfo._id == e.currentTarget.dataset.typeInfoId)
            return;

        console.log(e.currentTarget.dataset.typeInfoId)
        let afterSaleTypeInfos = this.data.afterSaleTypeInfos
        let typeInfo
        if (afterSaleTypeInfos.find) {
            typeInfo = afterSaleTypeInfos.find((o) => {
                return o._id == e.currentTarget.dataset.typeInfoId
            });
        } else {
            for (let i = 0; i < afterSaleTypeInfos.length; i++) {
                if (afterSaleTypeInfos[i]._id == e.currentTarget.dataset.typeInfoId) {
                    typeInfo = afterSaleTypeInfos[i]
                    break
                }
            }
        }

        let current = this.data.current
        current['type'] = typeInfo._id
        this.setData({
            selectedTypeInfo: typeInfo,
            current
        });
        console.log(this.data.current)
    },
    onLoad: function (options) {
        console.log('after-sale-details onLoad ' + options.afterSaleId)
        let that = this
        app.toast.init(this)

        if (!options.afterSaleId) {
            this.setData({
                current: { orderId: options.orderId }
            })
            options.type && this.typeInfoTap({
                currentTarget: { dataset: { typeInfoId: options.type } }
            })
        }
        options.afterSaleId && app.libs.http.get(app.config[keys.CONFIG_SERVER].getBizUrl() + 'afterSale/' + options.afterSaleId, (afterSale) => {
            that.setData({
                current: afterSale
            })
        })
    }

})