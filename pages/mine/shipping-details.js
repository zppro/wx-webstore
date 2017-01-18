import regionPicker from '../../components/region-picker/region-picker'
import keys from '../../config/keys.js'
var app = getApp()
Page({
    data: {
        defaultFlag: false,
        needNavigationBack: false,
        current: {},
        windowHeight: 627 - 45
    },
    //事件处理函数
    setDefault: function () {
        this.setData({
            defaultFlag: !this.data.defaultFlag
        })
    },
    openRegionPickerDialog: function () {
        regionPicker.openRegionPicker();
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
            app.libs.http.save(app.config[keys.CONFIG_SERVER].getBizUrl() + 'shipping', current, (ret) => {
                if (that.data.needNavigationBack) {
                    wx.setStorage({
                        key: keys.NEW_ADDED,
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
                    wx.redirectTo({ url: './shipping-list' })
                }
            }, { loadingText: '收货地址保存中...', toastInfo: '收货地址保存成功' })
        }
    },
    setInputData: function (e) {
        var fieldName = e.currentTarget.dataset.fieldName;
        var data = {}
        data[fieldName] = e.detail.value
        this.setData(data)
    },
    checkData: function () {
        if (app.util.isEmpty(this.data.current.shipping_nickname)) {
            app.toast.showError('填写收货人');
            return false
        }
        if (app.util.isEmpty(this.data.current.shipping_phone)) {
            app.toast.showError('填写收货人手机');
            return false
        }
        if (!app.util.isPhone(this.data.current.shipping_phone)) {
            app.toast.showError('收货人手机格式错误');
            return false
        }
        if (app.util.isEmpty(this.data.current.province) ||
            app.util.isEmpty(this.data.current.city) ||
            app.util.isEmpty(this.data.current.area)) {
            app.toast.showError('所在地区不完整');
            return false
        }
        if (app.util.isEmpty(this.data.current.address)) {
            app.toast.showError('填写收货地址');
            return false
        }
        return true
    },
    onLoad: function (options) {
        console.log('shipping-details onLoad ' + options.shippingId)
        let that = this
        let title
        if (options.shippingId) {
            title = '添加新地址'
        } else {
            title = '编辑地址'
        }
        wx.setNavigationBarTitle({
            title
        })
        wx.getSystemInfo({
            success: function (ret) {
                that.setData({
                    windowHeight: ret.windowHeight - 45
                })
            }
        })
        app.toast.init(this)
        regionPicker.init(this, {
            pickOk: function ({province = {}, city = {}, area = {}}) {
                let current = that.data.current
                current.province = province.name
                current.city = city.name
                current.area = area.name
                that.setData({
                    current
                })
            },
            fetchProvinces: function (cb) {
                app.libs.http.get(app.config[keys.CONFIG_SERVER].getBizUrl() + 'share/provinces', (provinces) => {
                    if (cb && typeof cb == 'function') cb(provinces)
                })
            },
            fetchCities: function (province, cb) {
                if (!province) {
                    console.log('no province filter')
                    return
                }
                app.libs.http.get(app.config[keys.CONFIG_SERVER].getBizUrl() + 'share/cities/' + province.id, (cities) => {
                    if (cb && typeof cb == 'function') cb(cities)
                })
            },
            fetchAreas: function (province, city, cb) {
                if (!province || !city) {
                    console.log('no province or city filter')
                    return
                }
                app.libs.http.get(app.config[keys.CONFIG_SERVER].getBizUrl() + 'share/areas/' + province.id + ',' + city.id, (areas) => {
                    if (cb && typeof cb == 'function') cb(areas)
                })
            }
        })
        this.setData({
            needNavigationBack: !!options.needNavigationBack
        })
        options.shippingId && app.libs.http.get(app.config[keys.CONFIG_SERVER].getBizUrl() + 'shipping/' + options.shippingId, (shipping) => {
            that.setData({
                defaultFlag: shipping.default_flag,
                current: shipping
            })
        })
    }
})