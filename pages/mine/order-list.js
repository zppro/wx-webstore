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
      key: keys.STG_ORDER_IS_CHANGED,
      success: function (res) {
        console.log('onShow res.data.isOrderChanged:' + res.data.isOrderChanged)
        if (res.data.isOrderChanged) {
          that.fetchData(true, () => {
            wx.removeStorage({
              key: keys.STG_ORDER_IS_CHANGED,
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
  payTap2: function (e) {
    // 不能删除，防止事件冒泡
  },
  payTap: function (e) {
    let that = this
    let orderId = e.currentTarget.dataset.orderId
    console.log(e)

    wx.showActionSheet({
      itemList: ['确认支付该订单？'],
      itemColor: '#f00',
      success: function (res) {
        if (res.tapIndex == 0) {
          app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'orderRepay/' + orderId, { appid: app.appid, formId: e.detail.formId }, (prepayRet) => {
            var requestPaymentObject = prepayRet.requestPaymentObject
            let orderId = prepayRet.orderId
            let url = '../mine/order-details?orderId=' + orderId
            let templateId = app.config[keys.CONFIG_SERVER].wxAppConfig.getTemplateId('OrderPayed')
            requestPaymentObject['success'] = function (res) {
              console.log('订单支付成功')
              app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'orderPaySuccess/' + orderId, { pay_type: 'A0003' }, (updated) => {

                let sceneId = prepayRet.scene_id
                app.requestAccessToken(function (accessToken) {
                  console.log('accessToken： ' + accessToken + ' templateId:  ' + templateId + ' sceneId:' + sceneId)
                  wx.request({
                    url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + accessToken,
                    data: {
                      touser: updated.open_id,
                      template_id: templateId,
                      form_id: sceneId,
                      data: {
                        "keyword1": {
                          "value": updated.code,
                          "color": "#4a4a4a"
                        },
                        "keyword2": {
                          "value": updated.items[0].spu_name,
                          "color": "#9b9b9b"
                        },
                        "keyword3": {
                          "value": '￥' + updated.amount + '元',
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
  applyForRefundTap: function (e) {
    wx.navigateTo({
      url: './after-sale-details?orderId=' + e.currentTarget.dataset.orderId + '&type=A0007'
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
    app.toast.init(this)
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