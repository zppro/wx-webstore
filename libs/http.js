// var http = {
//    get: function(url, cb, options) {
//         this.fetch(url, {}, cb, options);
//     },
//     post: function(url, data, cb, options) {
//         this.fetch(url, data, cb, Object.assign({}, options,{method: 'POST'}));
//     },
//     fetch: function(url, data, cb, {method = 'GET', title = '数据载入中...', moreToastInfo = false} = {}) {
//         var app = getApp()
//         wx.showToast({title, icon:'loading'});
//         wx.request({
//             url, data,
//             method,
//             success: function(res) {
//                 if (res.data.success) {
//                     moreToastInfo && app.toast.show('载入成功', {duration: 1500})
//                     if (res.data.rows){
//                         cb(res.data.rows)
//                     } else if (res.data.ret) {
//                         cb(res.data.ret)
//                     } else {
//                         cb()
//                     }
//                 } else {
//                     moreToastInfo && app.toast.show(res.data.msg, {duration: 1500})
//                     console.log(res.data.code + res.data.msg)
//                 }
//             },
//             fail: function (res) {
//                 console.log(res.data)
//             },
//             complete: function() {
//                 wx.hideToast();
//             }
//         })
//     }
// }

// module.exports = {
    
// }

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
            fetch: function(url, data, cb, {method = 'GET', title = '数据载入中...', moreToastInfo = false} = {}) {
                var app = getApp()
                console.log(app);
                wx.showToast({title, icon:'loading'});
                wx.request({
                    url, data,
                    method,
                    success: function(res) {
                        if (res.data.success) {
                            moreToastInfo && app.toast.show('载入成功', {duration: 1500})
                            if (res.data.rows){
                                cb(res.data.rows)
                            } else if (res.data.ret) {
                                cb(res.data.ret)
                            } else {
                                cb()
                            }
                        } else {
                            moreToastInfo && app.toast.show(res.data.msg, {duration: 1500})
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