//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    spus: []
  },
  //事件处理函数
  spuTap: function () {
    wx.navigateTo({
      url: './spu-details'
    })
  },
  onLoad: function () {
    console.log('index onLoad')
    this.setData({
        spus:[
          {id: '1bb', name: '梧斯源睡眠监测仪器', img: '/images/test/banner.jpg', sale_price: 888, market_price: 1889},
          {id: 'c33', name: '防雾霾口罩', img: '/images/test/banner.jpg', sale_price: 32, market_price: 134}
        ]
      })
  }
})