import keys from '../../config/keys.js'
let app = getApp()
Page({
  data: {
    userInfo: {},
    orderStat: {},
    contactButtonLoop: [],
    contactButtonLoopItemWidth: 33
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
  contactUSTap: function (e) {
    console.log(345)
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
  clearStorageTap: function (e) {
    wx.showActionSheet({
      itemList: ['确认清除缓存？'],
      itemColor: '#f00',
      success: function (res) {
        if (res.tapIndex == 0) {
          wx.removeStorage({
            key: keys.STG_CHANNEL_UNIT,
            success: function (res) {
              console.log('清除缓存：')
              console.log(res.data)
              app.toast.show('缓存清除成功')
            }
          })
        }
      }
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
    wx.getSystemInfo({
      success: function (ret) {
        console.log(ret);
        let itemCount = Math.floor(ret.windowWidth / that.data.contactButtonLoopItemWidth)
        that.setData({
          contactButtonLoop: Array.apply(null, Array(itemCount)).map(function (_, i) { return i; })
        })
      }
    })
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
    this.fetchData()
  }
})