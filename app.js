//app.js
import libs from 'utils/libs.js'
import util from 'utils/util.js'
import keys from 'config/keys.js'
import toast from 'components/wx-toast/wx-toast'

const APPID = 'wx47dcb6f48e7a35c2'
const DEBUG = 'DEBUG_HOME'
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var that = this;
    // 读取配置
    this.config[keys.CONFIG_SERVER] = require('config/server.js')(DEBUG)

    // 读取缓存中的session_key并从服务端读取session
    let gen_session_key = wx.getStorageSync(keys.SESSION_KEY_NAME);
    console.log(gen_session_key);
    if (gen_session_key) {
      this.libs.http.get(this.config[keys.CONFIG_SERVER].getWXUrl() + 'getSession/' + gen_session_key, (session) => {
        console.log(session);
        if (!session) {
          //过期重新请求
          that.requestSession()
        } else {
          that.globalData.session = session;
          that.getUserInfo();
        }
      });
    } else {
      that.requestSession();
    }
  },
  requestSession: function () {
    console.log('requestSession');
    var that = this;
    wx.login({
      success: function (res1) {
        console.log('requestSession with code:' + res1.code);
        that.libs.http.post(that.config[keys.CONFIG_SERVER].getWXUrl() + 'requestSession', { appid: APPID, code: res1.code }, (ret) => {
          
          if (ret && ret.session_key && ret.session_value) {
            wx.setStorageSync(keys.SESSION_KEY_NAME, ret.session_key);
            that.globalData.session = ret.session_value;
          }
        });
        wx.getUserInfo({
          success: function (res2) {
            that.globalData.userInfo = res2.userInfo
          }
        });
      },
      fail: function (err) {
        console.log('requestSession error');
        console.log(err);
      }
    });

  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function (res1) {
          console.log(res1);
          wx.getUserInfo({
            success: function (res2) {
              that.globalData.userInfo = res2.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  getSession: function () {
    return this.globalData.session
  },
  toast,
  util,
  libs,
  appid: APPID,
  env: {
    DEBUG
  },
  config: {},
  globalData: {
    session: null,
    userInfo: null
  }
})