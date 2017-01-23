import keys from '../../config/keys.js'
let app = getApp()
Page({
  data: {
    userInfo: {},
    orderStat: {}
  },
  onPullDownRefresh: function () {
    this.fetchData(() => { wx.stopPullDownRefresh() })
  },
  //事件处理函数
  orderTap: function (e) {
    console.log(e.currentTarget.dataset);
    wx.navigateTo({
      url: './order-list?order_status=' + e.currentTarget.dataset.orderStatus
    })
  },
  afterSaleTap: function () {
    wx.navigateTo({
      url: './after-sale-list'
    })
  },
  shippingTap: function (e) {
    wx.navigateTo({
      url: './shipping-list'
    })
  },
  invoiceTap: function (e) {
    wx.navigateTo({
      url: './invoice-list'
    })
  },
  fetchData: function (cb) {
    let that = this;
    app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'orderStat/', { tenantId: app.config[keys.CONFIG_SERVER].getTenantId(), open_id: app.getSession().openid }, (orderStat) => {
      console.log(orderStat)
      that.setData({
        orderStat
      })
    })
    if (typeof cb == 'function') cb()
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    app.toast.init(this)
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
    this.fetchData()
  }
})