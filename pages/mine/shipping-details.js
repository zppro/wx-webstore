import regionPicker from '../../components/region-picker/region-picker'
import keys from '../../config/keys.js'
var app = getApp()
Page({
    data: {
        current: {},
        windowHeight: 627 - 45
    },
    //事件处理函数
    setDefault: function () {
        this.setData({
            current: {
                defaultFlag: !this.data.current.defaultFlag
            }
        })
    },
    openRegionPickerDialog: function () {
        regionPicker.openRegionPicker();
    },
    save: function () {
        // check data validation
    },
    setInputData: function (e) {
        var fieldName = e.currentTarget.dataset.fieldName;
        var data = {}
        data[fieldName] = e.detail.value
        this.setData(data)
    },
    checkData: function () {
        if (app.util.isEmpty(this.current.shipping_nickname)) {
            app.toast.showError('填写收货人');
            return false
        }
        if (app.util.isEmpty(this.current.shipping_phone)) {
            app.toast.showError('填写收货人手机');
            return false
        }
        if (!app.util.isPhone(this.current.shipping_phone)) {
            app.toast.showError('收货人手机格式错误');
            return false
        }
        return true
    },
    onLoad: function (options) {
        console.log('shipping-details onLoad ' + options.shippingId)
        var that = this;
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
        options.shippingId && app.libs.http.get(app.config[keys.CONFIG_SERVER].getBizUrl() + 'shipping/' + options.shippingId, (shipping) => {
            that.setData({
                current: shipping
            })
        })
    }
})