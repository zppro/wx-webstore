//app.js
import libs from 'utils/libs.js'
import keys from 'config/keys.js'
import toast from 'components/wx-toast/wx-toast'

const DEBUG = true
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 读取配置
    this.config[keys.CONFIG_SERVER] = require('config/server.js')(DEBUG)
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  toast,
  libs,
  env:{
    DEBUG
  },
  config: {},
  globalData:{
    userInfo:null
  }
})