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
    this.setData({ isAppendDisabled: false })
  },
  onReachBottom: function () {
    if (this.data.isAppendDisabled) return;
    this.fetchData(false)
  },
  onShow: function () {
    let that = this
    wx.getStorage({
      key: keys.ORDER_IS_CHANGED,
      success: function (res) {
        console.log('onShow res.data.isOrderChanged:' + res.data.isOrderChanged)
        if (res.data.isOrderChanged) {
          that.fetchData(true, () => {
            wx.removeStorage({
              key: keys.ORDER_IS_CHANGED,
              success: (res2) => {
                console.log(res2.data)
              }
            })
          })
        }
      }
    })
  },
  //事件处理函数
  payTap: function (e) {
    let that = this
    let orderId = e.currentTarget.dataset.orderId
    wx.showActionSheet({
      itemList: ['确认支付该订单？'],
      itemColor: '#f00',
      success: function (res) {
        if (res.tapIndex == 0) {
          app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'orderRepay/' + orderId, { appid: app.appid }, (prepayRet) => {
            var requestPaymentObject = prepayRet.requestPaymentObject
            var orderId = prepayRet.orderId
            requestPaymentObject['success'] = function (res) {
              console.log('订单支付成功')
              app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'orderPaySuccess/' + orderId, { pay_type: 'A0003' }, (updated) => {
                app.toast.show('订单支付成功')
                let orders = that.data.orders
                let i = -1;
                if (orders.findIndex) {
                  i = orders.findIndex((o) => {
                    return o._id == orderId
                  });
                } else {
                  for (i = 0; i < orders.length; i++) {
                    if (orders[i]._id == orderId) {
                      break
                    }
                  }
                }
                if (i != -1) {
                  orders.splice(i, 1, updated)
                  that.setData({
                    orders
                  })
                }
              }, (ret) => {
                app.toast.showError('支付状态更新失败')
              });
            }
            requestPaymentObject['fail'] = function (res) {
              console.log(res);
              app.toast.showError('微信支付失败')
            }
            console.log(requestPaymentObject);
            wx.requestPayment(requestPaymentObject);
          }, { loadingText: '订单支付中...', toastInfo: '微信支付成功' });
        }
      }
    })
  },
  confirmReceiptGoodsTap: function (e) {
    let that = this
    let orderId = e.currentTarget.dataset.orderId
    wx.showActionSheet({
      itemList: ['确认已收取货物？'],
      itemColor: '#f00',
      success: function (res) {
        if (res.tapIndex == 0) {
          app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'orderConfirmReceiptGoods/' + orderId, null, (updated) => {
            let orders = that.data.orders
            let i = -1;
            if (orders.findIndex) {
              i = orders.findIndex((o) => {
                return o._id == orderId
              });
            } else {
              for (i = 0; i < orders.length; i++) {
                if (orders[i]._id == orderId) {
                  break
                }
              }
            }
            if (i != -1) {
              orders.splice(i, 1, updated)
              that.setData({
                orders
              })
            }
          }, { loadingText: '确认中...', toastInfo: '确定收货成功' })
        }
      }
    })
  },
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