import keys from '../../config/keys.js'
import settings from '../../config/settings.js'
//获取应用实例
var app = getApp()
Page({
    data: {
        isAppendDisabled: false,
        isWaitAddNewShippingInfo: false,
        invoices: [],
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
        if (this.data.isWaitAddNewInvoiceInfo) {
            let that = this
            this.fetchData(true, () => {
                // wx.stopPullDownRefresh()
                that.setData({
                    isWaitAddNewInvoiceInfo: false
                })
            })
        }
    },
    //事件处理函数
    orderTap: function (e) {
        wx.navigateTo({
            url: './order-details?orderId=' + e.currentTarget.dataset.orderId
        })
    },
     onLoad: function (options) {
        console.log('invoice-list onLoad ')
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