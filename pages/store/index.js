//index.js
import keys from '../../config/keys.js'
//获取应用实例
var app = getApp()
Page({
  data: {
    spus: []
  },
  //事件处理函数
  spuTap: function (e) {
    console.log(e.currentTarget.dataset.spuId);
    wx.navigateTo({
      url: './spu-details?spuId=' + e.currentTarget.dataset.spuId
    })
  },
  onLoad: function () {
    console.log('index onLoad')
    var that = this;
    app.toast.init(this);
    console.log(app.config[keys.CONFIG_SERVER])
    app.libs.http.post(app.config[keys.CONFIG_SERVER].root + 'spus', {page: {size: 10, skip:0}}, (spus)=>{
      console.log(spus);
      that.setData({
        spus
      });
    });
  }
})