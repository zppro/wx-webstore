import keys from '../../config/keys.js'
import settings from '../../config/settings.js'
//获取应用实例
var app = getApp()
Page({
    data: {
        isAppendDisabled: false,
        isWaitAddNewInvoiceInfo: false,
        invoices: [],
        windowHeight: 627 - 45
    },
    onPullDownRefresh: function () {
        this.fetchData(true, () => { wx.stopPullDownRefresh() })
        this.setData({ isAppendDisabled: false })
    },
    onReachBottom: function () {
        if (this.data.isAppendDisabled) return;
        this.fetchData(false)
    },
    onShow: function () {
        if (this.data.isWaitAddNewInvoiceInfo) {
            let that = this
            this.fetchData(true, () => {
                // wx.stopPullDownRefresh()
                that.setData({
                    isWaitAddNewInvoiceInfo: false
                })
            })
        }
    },
    //事件处理函数
    setDefaultTap: function (e) {
        let that = this
        let invoiceId = e.currentTarget.dataset.invoiceId
        app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'invoiceSetDefault/' + invoiceId, {}, () => {
            let invoices = that.data.invoices
            //let invoices = [{id:'1',title:'test',type_name:'testname'}]
            for (let i = 0; i < invoices.length; i++) {
                if (invoices[i].default_flag) {
                    invoices[i].default_flag = false
                    break
                }
            }
            for (let i = 0; i < invoices.length; i++) {
                if (invoices[i].id == invoiceId) {
                    invoices[i].default_flag = true
                    break
                }
            }
            that.setData({
                invoices
            })
        }, { loadingText: '设置中...', toastInfo: '设为默认成功' })
    },
    editTap: function (e) {
        this.setData({
            isWaitAddNewInvoiceInfo: true
        })
        wx.navigateTo({
            url: './invoice-details?needNavigationBack=true&invoiceId=' + e.currentTarget.dataset.invoiceId
        })

    },
    removeTap: function (e) {
        let that = this
        let invoiceId = e.currentTarget.dataset.invoiceId
        wx.showActionSheet({
            itemList: ['删除后无法恢复，继续？'],
            itemColor: '#f00',
            success: function (res) {
                if (res.tapIndex == 0) {
                    app.libs.http.delete(app.config[keys.CONFIG_SERVER].getBizUrl() + 'invoice/' + invoiceId, () => {
                        let invoices = that.data.invoices
                        let i = -1
                        for (i = 0; i < invoices.length; i++) {
                            if (invoices[i].id == invoiceId) {
                                break
                            }
                        }
                        if (i != -1) {
                            invoices.splice(i, 1)
                            that.setData({
                                invoices
                            })
                        }
                    }, { loadingText: '删除中...', toastInfo: '删除成功' })
                }
            }
        })
    },
    addNewTap: function () {
        this.setData({
            isWaitAddNewInvoiceInfo: true
        })
        wx.navigateTo({
            url: './invoice-details?needNavigationBack=true'
        })
    },
    fetchData: function (refresh, cb) {
        let that = this;
        let skip = refresh ? 0 : this.data.invoices.length;
        app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'invoices/', { tenantId: app.config[keys.CONFIG_SERVER].getTenantId(), open_id: app.getSession().openid, page: { size: settings.LIST_PAGE_SIZE, skip } }, (invoices) => {
            that.setData({
                isAppendDisabled: invoices.length == 0,
                invoices: refresh ? invoices : that.data.invoices.concat(invoices)
            })
        })
        if (cb && typeof cb == 'function') cb()
    },
    onLoad: function (options) {
        console.log('invoice-list onLoad ')
        let that = this
        wx.getSystemInfo({
            success: function (ret) {
                that.setData({
                    windowHeight: ret.windowHeight - 45
                })
            }
        })
        app.toast.init(this);
        this.fetchData(true)
    }
})