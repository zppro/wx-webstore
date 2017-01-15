module.exports = {
    init: function (page, {pickOk, fetchProvinces, fetchCities, fetchAreas, moveThreshold = 45}) {
        this.page = page
        this.page.closeRegionPicker = this.closeRegionPicker.bind(this)
        this.page.pickProvinceObject = this.pickProvinceObject.bind(this)
        this.page.pickCityObject = this.pickCityObject.bind(this)
        this.page.pickAreaObject = this.pickAreaObject.bind(this)
        this.page.provinceTap = this.provinceTap.bind(this)
        this.page.cityTap = this.cityTap.bind(this)
        this.page.areaTap = this.areaTap.bind(this)
        this.page.pickOkTap = this.pickOkTap.bind(this)
        this.page.regionPickerTouchStart = this.regionPickerTouchStart.bind(this)
        this.page.regionPickerTouchMove = this.regionPickerTouchMove.bind(this)
        this.page.regionPickerTouchEnd = this.regionPickerTouchEnd.bind(this)
        this.pickOk = pickOk
        this.fetchProvinces = fetchProvinces
        this.fetchCities = fetchCities
        this.fetchAreas = fetchAreas
        this.moveThreshold = moveThreshold
    },
    openRegionPicker: function () {
        console.log('openRegionPicker')
        let that = this
        this.page.setData({
            currentPickView: 'province',
            regionPickerUI: {
                isPopup: true,
                animationContentClass: 'region-picker-content-fade-in'
            }
        })

        setTimeout(() => {
            that.page.setData({
                regionPickerUI: {
                    isPopup: true,
                    animationMaskClass: 'region-picker-mask-fade-in',
                    animationContentClass: 'region-picker-content-fade-in'
                }
            })
            console.log(that.page.data.regionPickerUI);
        }, 300)
        let provinces = this.page.data.provinces
        if (!provinces || provinces.length == 0) {
            this.fetchProvinces && this.fetchProvinces(this.setProvinceRange.bind(this))
        } else {
            let cities = this.page.data.cities
            if (cities && cities.length > 0) {
                let areas = this.page.data.areas
                if (areas && areas.length > 0) {
                    if ( this.page.data._selectedAreaObject) {
                        this.page.setData({
                            currentPickView: 'area'
                        })
                    } else if( this.page.data._selectedCityObject) {
                        this.page.setData({
                            currentPickView: 'city'
                        })
                    } else {
                        this.page.setData({
                            currentPickView: 'province'
                        })
                    }
                }
            }
        }

    },
    closeRegionPicker: function () {
        if (this.page.data.regionPickerUI.isPopup) {
            console.log('closeRegionPicker')
            let that = this;
            let regionPickerUI = this.page.data.regionPickerUI
            regionPickerUI.animationMaskClass = 'region-picker-mask-fade-out'
            regionPickerUI.animationContentClass = 'region-picker-content-fade-out'
            this.page.setData({
                regionPickerUI
            })
            setTimeout(() => {
                that.page.setData({
                    regionPickerUI: {
                        isPopup: false
                    }
                })
            }, 100)// < 0.3s
        }
    },
    _cityToProvinceView: function () {
        let that = this
        this.page.setData({
            animationCityClass: 'region-picker-content-body-fade-out-right'
        })
        setTimeout(() => {
            that.page.setData({
                currentPickView: 'province',
                animationProvinceClass: 'region-picker-content-body-fade-in-left'
            })
        }, 300)
    },
    _areaToProvinceView: function () {
        let that = this
        this.page.setData({
            animationAreaClass: 'region-picker-content-body-fade-out-right'
        })
        setTimeout(() => {
            that.page.setData({
                currentPickView: 'province',
                animationProvinceClass: 'region-picker-content-body-fade-in-left'
            })
        }, 300)
    },
    _provinceToCityView: function () {
        let that = this
        this.page.setData({
            animationProvinceClass: 'region-picker-content-body-fade-out-left'
        })
        setTimeout(() => {
            that.page.setData({
                currentPickView: 'city',
                animationCityClass: 'region-picker-content-body-fade-in-right'
            })
        }, 300)
    },
    _areaToCityView: function () {
        let that = this
        this.page.setData({
            animationAreaClass: 'region-picker-content-body-fade-out-right'
        })
        setTimeout(() => {
            that.page.setData({
                currentPickView: 'city',
                animationCityClass: 'region-picker-content-body-fade-in-left'
            })
        }, 300)
    },
    _provinceToAreaView: function () {
        let that = this
        this.page.setData({
            animationProvinceClass: 'region-picker-content-body-fade-out-left'
        })
        setTimeout(() => {
            that.page.setData({
                currentPickView: 'area',
                animationAreaClass: 'region-picker-content-body-fade-in-right'
            })
        }, 300)
    },
    _cityToAreaView: function () {
        let that = this
        this.page.setData({
            animationCityClass: 'region-picker-content-body-fade-out-left'
        })
        setTimeout(() => {
            that.page.setData({
                currentPickView: 'area',
                animationAreaClass: 'region-picker-content-body-fade-in-right'
            })
        }, 300)
    },
    provinceTap: function () {
        let currentPickView = this.page.data.currentPickView
        if (currentPickView == 'province') return
        else if (currentPickView == 'city') {
            this._cityToProvinceView()
        } else if (currentPickView == 'area') {
            this._areaToProvinceView()
        }
    },
    cityTap: function () {
        let currentPickView = this.page.data.currentPickView
        if (currentPickView == 'city') return
        else if (currentPickView == 'province') {
            this._provinceToCityView()
        } else if (currentPickView == 'area') {
            this._areaToCityView()
        }
    },
    areaTap: function () {
        let currentPickView = this.page.data.currentPickView
        if (currentPickView == 'area') return
        else if (currentPickView == 'city') {
            this._cityToAreaView()
        } else if (currentPickView == 'province') {
            this._provinceToAreaView()
        }
    },
    pickOkTap: function () {
        this.pickOk && this.pickOk({ province: this.page.data._selectedProvinceObject, city: this.page.data._selectedCityObject, area: this.page.data._selectedAreaObject })
        this.closeRegionPicker()
    },
    regionPickerTouchStart: function (e) {
        this.page.setData({
            startPoint: [e.touches[0].pageX, e.touches[0].pageY]
        })
    },
    regionPickerTouchMove: function (e) {
        var curPoint = [e.touches[0].pageX, e.touches[0].pageY];
        var startPoint = this.page.data.startPoint;
        var deltaX = Math.abs(curPoint[0] - startPoint[0]);
        var deltaY = Math.abs(curPoint[1] - startPoint[1]);
        if (deltaX > deltaY) {
            // 在X轴上变动大大
            let regionPickerDirection;
            if (curPoint[0] < startPoint[0]) {
                regionPickerDirection = 'left'
                console.log(e.timeStamp + ' - touch left move');
            } else {
                regionPickerDirection = 'right'
                console.log(e.timeStamp + ' - touch right move');
            }
            this.page.setData({
                regionPickerDirection,
                regionPickerDeltaX: deltaX
            });
        }
    },
    regionPickerTouchEnd: function (e) {
        let currentPickView = this.page.data.currentPickView
        let regionPickerDirection = this.page.data.regionPickerDirection;
        let regionPickerDeltaX = this.page.data.regionPickerDeltaX
        if (regionPickerDeltaX > this.moveThreshold) {
            if (regionPickerDirection == 'left') {
                if (currentPickView == 'province') {
                    this._provinceToCityView()
                } else if (currentPickView == 'city') {
                    this._cityToAreaView()
                }
            } else if (regionPickerDirection == 'right') {
                if (currentPickView == 'area') {
                    this._areaToCityView()
                } else if (currentPickView == 'city') {
                    this._cityToProvinceView()
                }
            }
        }
    },
    setProvinceRange: function (provinces) {
        this.page.setData({
            provinces
        })
        if (provinces.length == 1) {
            let province = provinces[0]
            this.page.setData({
                _selectedProvinceObject: province,
                animationProvinceClass: 'region-picker-content-body-fade-out-left'
            })
            this.fetchCities && this.fetchCities(province, this.setCityRange.bind(this))
        }
    },
    setCityRange: function (cities) {
        this.page.setData({
            cities,
            currentPickView: 'city',
            animationCityClass: 'region-picker-content-body-fade-in-right'
        })
        if (cities.length == 1) {
            let city = cities[0]
            this.page.setData({
                _selectedCityObject: city,
                animationCityClass: 'region-picker-content-body-fade-out-left'
            })
            this.fetchAreas && this.fetchAreas(this.page.data._selectedProvinceObject, city, this.setAreaRange.bind(this))
        }
    },
    setAreaRange: function (areas) {
        console.log(areas)
        this.page.setData({
            areas,
            currentPickView: 'area',
            animationAreaClass: 'region-picker-content-body-fade-in-right'
        })
    },
    pickProvinceObject: function (e) {
        let that = this
        let proviceId = e.currentTarget.dataset.provinceId
        let provinces = this.page.data.provinces
        for (var i = 0; i < provinces.length; i++) {
            let province = provinces[i]
            if (province.id == proviceId) {
                that.page.setData({
                    _selectedProvinceObject: province,
                    animationProvinceClass: 'region-picker-content-body-fade-out-left'
                })
                that.fetchCities && that.fetchCities(province, that.setCityRange.bind(that))
                break
            }
        }
    }
    ,
    pickCityObject: function (e) {
        var that = this;
        let cityId = e.currentTarget.dataset.cityId
        let cities = this.page.data.cities
        for (var i = 0; i < cities.length; i++) {
            let city = cities[i]
            if (city.id == cityId) {
                that.page.setData({
                    _selectedCityObject: city,
                    animationCityClass: 'region-picker-content-body-fade-out-left'
                })
                that.fetchAreas && that.fetchAreas(that.page.data._selectedProvinceObject, city, that.setAreaRange.bind(that))
                break
            }
        }

    },
    pickAreaObject: function (e) {
        var that = this;
        let areaId = e.currentTarget.dataset.areaId
        let areas = this.page.data.areas
        for (var i = 0; i < areas.length; i++) {
            let area = areas[i]
            if (area.id == areaId) {
                that.page.setData({
                    _selectedAreaObject: area
                })
                break
            }
        }
    }
}