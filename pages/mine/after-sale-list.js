import keys from '../../config/keys.js'
import settings from '../../config/settings.js'
//获取应用实例
var app = getApp()
Page({
    data: {
        isAppendDisabled: false,
        isWaitAddNewAfterSaleInfo: false,
        pageOptions: {},
        afterSale: [
            // {id:"1",type:"我要换货",biz_status_name:"未处理",memo:"有明显破损",code:"123456",orderId:"1"},
            // {id:"1",type:"我要换货",biz_status_name:"未处理",memo:"有明显破损",code:"123456"}
        ],
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
        if (this.data.isWaitAddNewAfterSaleInfo) {
            let that = this
            this.fetchData(true, () => {
                // wx.stopPullDownRefresh()
                that.setData({
                    isWaitAddNewAfterSaleInfo: false
                })
            })
        }
    },
    //事件处理函数
    fetchData: function (refresh, cb) {
        let that = this;
        let skip = refresh ? 0 : this.data.afterSale.length;
        app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'afterSale/', {biz_status_name:this.data.pageOptions.biz_status_name, tenantId: app.config[keys.CONFIG_SERVER].getTenantId(), open_id: app.getSession().openid, page: { size: settings.LIST_PAGE_SIZE, skip } }, (afterSale) => {
            that.setData({
                isAppendDisabled: afterSale.length == 0,
                afterSale: refresh ? afterSale : that.data.afterSale.concat(afterSale)
            })
        })
        if (cb && typeof cb == 'function') cb()
    },
    orderTap: function (e) {
        wx.navigateTo({
            url: './order-details?orderId=' + e.currentTarget.dataset.orderId
        })
    },
    onLoad: function (options) {
        console.log('after-sale-list onLoad ')
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