;(function (factory) {
    module.exports = factory()
}((function () { 'use strict';
    var http = {
            save: function (url, data, successFn, bizFailFn, options) {
                data.id ? this.put(url+ '/' + data.id, data, successFn, bizFailFn, options) : this.post(url, data, successFn, bizFailFn, options)
            },
            get: function(url, successFn, bizFailFn, options) {
                this.fetch(url, {}, successFn, bizFailFn, options);
            },
            post: function(url, data, successFn, bizFailFn, options) {
                console.log(url);
                options = options || {};
                options.method = 'POST';
                this.fetch(url, data, successFn, bizFailFn, options);
            },
            put: function(url, data, successFn, bizFailFn, options) {
                console.log(url);
                options = options || {};
                options.method = 'PUT';
                this.fetch(url, data, successFn, bizFailFn, options);
            },
            fetch: function(url, data, successFn, bizFailFn, {method = 'GET', loadingText = '数据载入中...', toastInfo = '' } = {}) {
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
                                successFn(res.data.rows)
                            } else if (res.data.ret) {
                                successFn(res.data.ret)
                            } else {
                                successFn()
                            }
                        } else {
                            app.toast.showError(res.data.msg)
                            console.log(res.data.code + '/'+ res.data.msg)
                            if (bizFailFn && typeof bizFailFn == 'function') {
                                bizFailFn(res.data)
                            }
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