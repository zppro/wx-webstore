;(function (factory) {
    module.exports = factory()
}((function () { 'use strict';
    var http = {
            get: function(url, cb, options) {
                this.fetch(url, {}, cb, options);
            },
            post: function(url, data, cb, options) {
                console.log(url);
                options = options || {};
                options.method = 'POST';
                this.fetch(url, data, cb, options);
            },
            fetch: function(url, data, cb, {method = 'GET', loadingText = '数据载入中...', toastInfo = '' } = {}) {
                var app = getApp()
                console.log(url);
                wx.showToast({title: loadingText, icon:'loading'});
                wx.request({
                    url, data,
                    method,
                    success: function(res) {
                        if (res.data.success) {
                            console.log(!!toastInfo)
                            toastInfo && app.toast.show(toastInfo, {duration: 1500})
                            if (res.data.rows){
                                cb(res.data.rows)
                            } else if (res.data.ret) {
                                cb(res.data.ret)
                            } else {
                                cb()
                            }
                        } else {
                            console.log(res.data);
                            app.toast.showError(res.data.msg)
                            console.log(res.data.code + res.data.msg)
                        }
                    },
                    fail: function (res) {
                        console.log('fail');
                        console.log(res)
                    },
                    complete: function() {
                        wx.hideToast();
                    }
                })
            }
    }
    return http;
})));