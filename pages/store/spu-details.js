//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    current: []
  },
  onLoad: function () {
    console.log('spu-details onLoad')
    this.setData({
      current: {id: '1bb', name: '梧斯源睡眠监测仪器', img: '/images/test/banner.jpg', sale_price: 888, market_price: 1889}
    })
  }
})