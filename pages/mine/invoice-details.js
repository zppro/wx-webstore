import keys from '../../config/keys.js'
var app = getApp()
Page({
    data: {
        defaultFlag: false,
        needNavigationBack: false,
        current: { type: 'A0001', title_type: 'A0003', content: '明细' },
        types: [
            { _id: 'A0001', name: '纸质发票' },
            { _id: 'A0005', name: '增值税发票' }
        ],
        titleTypes: [
            { _id: 'A0001', name: '个人' },
            { _id: 'A0003', name: '单位' }
        ],
        windowHeight: 627 - 45
    },
    //事件处理函数
    setDefault: function () {
        this.setData({
            defaultFlag: !this.data.defaultFlag
        })
    },
    typeTap: function (e) {
        let type = e.currentTarget.dataset.type
        let current = this.data.current
        if (type == current.type) return
        current.type = type
        if (type == 'A0005' && current.title_type != 'A0003') {
            current.title_type = 'A0003'
        }
        this.setData({
            current
        })
    },
    titleTypeTap: function (e) {
        let titleType = e.currentTarget.dataset.titleType
        let current = this.data.current
        if (titleType == current.title_type) return
        current.title_type = titleType
        this.setData({
            current
        })
    },
    save: function () {
        // check data validation
        var that = this;
        if (this.checkData()) {
            let current = that.data.current;
            current.default_flag = this.data.defaultFlag
            if (!current.id) {
                current.open_id = app.getSession().openid
                current.tenantId = app.config[keys.CONFIG_SERVER].getTenantId()
            }
            if (!current.content) {
                current.content = '明细'
            }
            app.libs.http.save(app.config[keys.CONFIG_SERVER].getBizUrl() + 'invoice', current, (ret) => {
                if (that.data.needNavigationBack) {
                    wx.setStorage({
                        key: keys.STG_NEW_ADDED,
                        data: ret,
                        success: function (res) {
                            // success
                            wx.navigateBack()
                        },
                        fail: function (err) {
                            // fail
                            console.log(err);
                            app.toast.show(err, { icon: 'warn', duration: 1500 })
                        }
                    })
                } else {
                    wx.redirectTo({ url: './mine' })
                }
            }, { loadingText: '开票信息保存中...', toastInfo: '开票信息保存成功' })
        }
    },
    setInputData: function (e) {
        var fieldName = e.currentTarget.dataset.fieldName;
        var data = {}
        data[fieldName] = e.detail.value
        this.setData(data)
    },
    checkData: function () {
        if (app.util.isEmpty(this.data.current.title)) {
            app.toast.showError('填写发票抬头');
            return false
        }
        return true
    },
    onLoad: function (options) {
        console.log('invoice-details onLoad ' + options.invoiceId)
        let that = this
        let title
        if (options.invoiceId) {
            title = '添加新开票信息'
        } else {
            title = '编辑开票信息'
        }
        wx.setNavigationBarTitle({
            title
        })
        // wx.getSystemInfo({
        //     success: function (ret) {
        //         that.setData({
        //             windowHeight: ret.windowHeight - 45
        //         })
        //     }
        // })
        app.toast.init(this)
        this.setData({
            needNavigationBack: !!options.needNavigationBack
        })
        options.invoiceId && app.libs.http.get(app.config[keys.CONFIG_SERVER].getBizUrl() + 'invoice/' + options.invoiceId, (invoice) => {
            that.setData({
                defaultFlag: invoice.default_flag,
                current: invoice
            })
        })
    }
})