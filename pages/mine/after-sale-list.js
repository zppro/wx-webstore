import keys from '../../config/keys.js'
import settings from '../../config/settings.js'
//获取应用实例
var app = getApp()
Page({
    data: {
        isAppendDisabled: false,
        pageOptions: {},
        afterSales:[],
        afterSalesTest: [
            {id:"1",type:"我要换货",biz_status_name:"未处理",memo:"有明显破损",code:"123456",orderId:"1", audit_result_name:"已经通过", audit_comment:"未处理"},
            {id:"1",type:"我要换货",biz_status_name:"未处理",memo:"有明显破损",code:"123456"}
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
    //事件处理函数
    fetchData: function (refresh, cb) {
        let that = this;
        let skip = refresh ? 0 : this.data.afterSales.length;
        app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'afterSales/', { tenantId: app.config[keys.CONFIG_SERVER].getTenantId(), open_id: app.getSession().openid, page: { size: settings.LIST_PAGE_SIZE, skip } }, (afterSales) => {
            that.setData({
                isAppendDisabled: afterSales.length == 0,
                afterSales: refresh ? afterSales : that.data.afterSale.concat(afterSales)
            })
        })
        if (cb && typeof cb == 'function') cb()
    },
    afterSaleTap: function (e) {
        wx.navigateTo({
            url: '../store/order-details?orderId=' + e.currentTarget.dataset.orderId
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