//index.js
import keys from '../../config/keys.js'
import settings from '../../config/settings.js'
//获取应用实例
var app = getApp()
Page({
  data: {
    isAppendDisabled: false,
    spus: []
  },
  onShareAppMessage: function () {
    let desc = app.config[keys.CONFIG_SERVER].wxAppConfig.description || '销售睡眠监测仪器，定位手环，机器人等'
    return {
      title: app.appname,
      desc,
      path: '/pages/store/index'
    }
  },
  onPullDownRefresh: function () {
    this.fetchData(true, () => { wx.stopPullDownRefresh() })
    this.setData({ isAppendDisabled: false })
  },
  onReachBottom: function () {
    if (this.data.isAppendDisabled) return;
    this.fetchData(false)
  },
  test: function () {
    wx.navigateTo({
      url: '../splash'
    })
  },
  //事件处理函数
  spuTap: function (e) {
    console.log(e.currentTarget.dataset.spuId);
    wx.navigateTo({
      url: './spu-details?spuId=' + e.currentTarget.dataset.spuId
    })
  },
  fetchData: function (refresh, cb) {
    let that = this;
    let skip = refresh ? 0 : this.data.spus.length;
    app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'spus', { tenantId: app.config[keys.CONFIG_SERVER].getTenantId(), page: { size: settings.LIST_PAGE_SIZE, skip } }, (spus) => {
      that.setData({
        isAppendDisabled: spus.length == 0,
        spus: refresh ? spus : that.data.spus.concat(spus)
      })
    })
    if (cb && typeof cb == 'function') cb()
  },
  onLoad: function () {
    console.log('index onLoad')
    app.toast.init(this)
    let that = this
    if (!app.appid) {
      setTimeout(() => {
        console.log('delay to wait load wxConfig')
        app.appname && wx.setNavigationBarTitle({
          title: app.appname
        })
        that.fetchData(true)
      }, 500)
    } else {
      app.appname && wx.setNavigationBarTitle({
        title: app.appname
      })
      that.fetchData(true)
    }

console.log(keys.CHANNEL_UNIT)
    wx.getStorage({
      key: keys.CHANNEL_UNIT,
      success: function (res) {
        // success
        console.log(res.data)

      },
      fail: function (err) {
        // fail
        console.log(err);
      },
      complete: function () {
       
      }
    })
  }
})