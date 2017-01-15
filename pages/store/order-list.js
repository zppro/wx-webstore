import keys from '../../config/keys.js'
import settings from '../../config/settings.js'
//获取应用实例
var app = getApp()
Page({
  data: {
    isAppendDisabled: false,
    pageOptions: {},
    orders: []
  },
  onPullDownRefresh: function () {
    this.fetchData(true, () => { wx.stopPullDownRefresh() })
    this.setData({isAppendDisabled: false})
  },
  onReachBottom: function () {
    if (this.data.isAppendDisabled) return;
    this.fetchData(false)
  },
  //事件处理函数
  orderTap: function (e) {
    wx.navigateTo({
      url: './order-details?orderId=' + e.currentTarget.dataset.orderId
    })
  },
  fetchData: function (refresh, cb) {
    let that = this;
    let skip = refresh ? 0 : this.data.orders.length;
    app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'orders/', { order_status: this.data.pageOptions.order_status, tenantId: app.config[keys.CONFIG_SERVER].getTenantId(), open_id: app.getSession().openid, page: { size: settings.LIST_PAGE_SIZE, skip } }, (orders) => {
      that.setData({
        isAppendDisabled: orders.length == 0,
        orders: refresh ? orders : that.data.orders.concat(orders)
      })
    })
    if (cb && typeof cb == 'function') cb()
  },
  onLoad: function (options) {
    console.log('order-list onLoad on ' + options.order_status)
    app.toast.init(this);
    this.setData({
      pageOptions: options
    })
    let title = '全部-订单'
    if (options.order_status == 'A0001') {
      title = '未支付-订单'
    } else if (options.order_status == 'A0003') {
      title = '待发货-订单'
    } else if (options.order_status == 'A0005') {
      title = '待收货-订单'
    } else if (options.order_status == 'A0011,A0013') {
      title = '售后-订单'
    }
    wx.setNavigationBarTitle({
      title
    })
    this.fetchData(true)
  }
})