import keys from '../../config/keys.js'
import settings from '../../config/settings.js'
//获取应用实例
var app = getApp()
Page({
    data: {
        isAppendDisabled: false,
        isWaitAddNewShippingInfo: false,
        shippings: [],
        windowHeight: 627 - 45
    },
    onPullDownRefresh: function () {
        this.fetchData(true, () => { wx.stopPullDownRefresh() })
        this.setData({ isAppendDisabled: false })
    },
    onReachBottom: function () {
        if (this.data.isAppendDisabled) return;
        this.fetchData(false)
    },
    onShow: function () {
        if (this.data.isWaitAddNewShippingInfo) {
            let that = this
            this.fetchData(true, () => {
                // wx.stopPullDownRefresh()
                that.setData({
                    isWaitAddNewShippingInfo: false
                })
            })
        }
    },
    //事件处理函数
    setDefaultTap: function (e) {
        let that = this
        let shippingId = e.currentTarget.dataset.shippingId
        app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'shippingSetDefault/' + shippingId, {}, () => {
            let shippings = that.data.shippings
            for (let i = 0; i < shippings.length; i++) {
                if (shippings[i].default_flag) {
                    shippings[i].default_flag = false
                    break
                }
            }
            for (let i = 0; i < shippings.length; i++) {
                if (shippings[i].id == shippingId) {
                    shippings[i].default_flag = true
                    break
                }
            }
            that.setData({
                shippings
            })
        }, { loadingText: '设置中...', toastInfo: '设为默认成功' })
    },
    editTap: function (e) {
        this.setData({
            isWaitAddNewShippingInfo: true
        })
        wx.navigateTo({
            url: './shipping-details?needNavigationBack=true&shippingId=' + e.currentTarget.dataset.shippingId
        })

    },
    removeTap: function (e) {
        let that = this
        let shippingId = e.currentTarget.dataset.shippingId
        wx.showActionSheet({
            itemList: ['删除后无法恢复，继续？'],
            itemColor: '#f00',
            success: function (res) {
                if (res.tapIndex == 0) {
                    app.libs.http.delete(app.config[keys.CONFIG_SERVER].getBizUrl() + 'shipping/' + shippingId, () => {
                        let shippings = that.data.shippings
                        let i = -1
                        for (i = 0; i < shippings.length; i++) {
                            if (shippings[i].id == shippingId) {
                                break
                            }
                        }
                        if (i != -1) {
                            shippings.splice(i, 1)
                            that.setData({
                                shippings
                            })
                        }
                    }, { loadingText: '删除中...', toastInfo: '删除成功' })
                }
            }
        })
    },
    addNewTap: function () {
        this.setData({
            isWaitAddNewShippingInfo: true
        })
        wx.navigateTo({
            url: './shipping-details?needNavigationBack=true'
        })
    },
    fetchData: function (refresh, cb) {
        let that = this;
        let skip = refresh ? 0 : this.data.shippings.length;
        app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'shippings/', { tenantId: app.config[keys.CONFIG_SERVER].getTenantId(), open_id: app.getSession().openid, page: { size: settings.LIST_PAGE_SIZE, skip } }, (shippings) => {
            that.setData({
                isAppendDisabled: shippings.length == 0,
                shippings: refresh ? shippings : that.data.shippings.concat(shippings)
            })
        })
        if (cb && typeof cb == 'function') cb()
    },
    onLoad: function (options) {
        console.log('shipping-list onLoad ')
        let that = this
        wx.getSystemInfo({
            success: function (ret) {
                that.setData({
                    windowHeight: ret.windowHeight - 45
                })
            }
        })
        app.toast.init(this);
        this.fetchData(true)
    }
})