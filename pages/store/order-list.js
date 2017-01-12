import keys from '../../config/keys.js'
//获取应用实例
var app = getApp()
Page({
  data: {
    category: '',
    orders: []
  },
  //事件处理函数
  orderTap: function (e) {
    console.log(e.currentTarget.dataset.orderId);
    wx.navigateTo({
      url: './order-details?orderId=' + e.currentTarget.dataset.orderId
    })
  },
  onLoad: function (options) {
    console.log('order-list onLoad on ' + options.category)
    var that = this;
    app.toast.init(this);
     that.setData({
        category: options.category
      });
    console.log(app.config[keys.CONFIG_SERVER])
    app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'orders/' + this.data.category, {page: {size: 10, skip:0}}, (orders)=>{
      console.log(orders);
      that.setData({
        orders
      });
    });
  }
})