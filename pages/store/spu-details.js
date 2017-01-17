import quantityRegulator from '../../components/quantity-regulator/quantity-regulator'
import keys from '../../config/keys.js'
var app = getApp()
Page({
  data: {
    current: {},
    selected_sku: {},
    quantity: 1,
    windowHeight: 627 - 45,
    selectedShippingInfo: {
      // _id: '1',
      // province: '浙江',
      // city: '杭州市',
      // area: '余杭区',
      // address: '余杭镇XX小区1-3-102'
    },
    memberShippingInfos: [
      { _id: '1', province: '浙江', city: '杭州市', area: '余杭区', address: '余杭镇XX小区1-3-102' },
      { _id: '2', province: '浙江', city: '湖州市', area: '吴兴区', address: '城区XX小区1-3-303' },
      { _id: '3', province: '浙江', city: '湖州市', area: '吴兴区', address: '城区YY小区12-1-502' }
    ],
    isPageInfoShow: true,
    isPageIntroUrl: false,
    pageInfoAnimationClass: '',
    pageIntroUrlAnimationClass: '',
    isSKUSContainerPopup: false,
    isShippingInfoPickContainerPopup: false,
    isWaitAddNewShippingInfo: false,
    skusAnimationMaskClass: '',
    skusAnimationContentClass: '',
    shippingInfoAnimationMaskClass: '',
    shippingInfoAnimationContentClass: '',
    startPoint: [0, 0],
    spuPanDeltaUpY: 0,
    spuPanDeltaDownY: 0,
    spuPanThreshold: 45
  },
  onShareAppMessage: function () {
    return {
      title: this.data.current.name,
      desc: this.data.current.intro,
      path: '/pages/store/spu-details?spuId=' + this.data.current.id
    }
  },
  onShow: function () {
    console.log('on show isWaitAddNewShippingInfo: ' + this.data.isWaitAddNewShippingInfo);
    if (this.data.isWaitAddNewShippingInfo) {
      this.fetchMemberShippingInfos()
      this.setData({
        isWaitAddNewShippingInfo: false
      })
    }
  },
  //事件处理函数
  buyNow: function () {
    if (this.checkData()) {
      let spu = this.data.current;
      let sku = this.data.selected_sku;
      let quantity = this.data.quantity;
      let amount = sku.sale_price * quantity;
      wx.setStorage({
        key: keys.ORDER_CONFIRM_NOW,
        data: {
          shipping_info: this.data.selectedShippingInfo,
          items: [{
            spu_id: spu.id,
            spu_name: spu.name,
            sku_id: sku._id,
            sku_name: sku.name,
            img: spu.img,
            price: sku.sale_price,//下单单价 单位元
            market_price: sku.market_price,
            quantity: quantity//数量
          }],
          amount: new Number(amount).toFixed(2),
          shipping_fee: new Number(0).toFixed(2)
        },
        success: function (res) {
          // success
          wx.navigateTo({
            url: './order-confirm'
          });
        },
        fail: function (err) {
          // fail
          console.log(err);
          app.toast.show(err, { icon: 'warn', duration: 1500 })
        }
      });
    }
  },
  checkData: function () {
    if (app.util.isEmpty(this.data.selectedShippingInfo.id)) {
      app.toast.showError('请选择收货地址');
      return false
    }
    return true
  },
  openChangeSKUDialog: function () {
    var that = this;
    this.setData({
      isSKUSContainerPopup: true,
      skusAnimationContentClass: 'spu-popup-container-content-fade-in'
    })
    setTimeout(() => {
      that.setData({
        skusAnimationMaskClass: 'spu-popup-container-mask-fade-in'
      })
    }, 300);
  },
  closeChangeSKUDialog: function () {
    if (this.data.isSKUSContainerPopup) {
      var that = this;
      this.setData({
        skusAnimationMaskClass: 'spu-popup-container-mask-fade-out',
        skusAnimationContentClass: 'spu-popup-container-content-fade-out'
      })
      setTimeout(() => {
        that.setData({
          isSKUSContainerPopup: false
        })
      }, 300);
    }
  },
  skuTap: function (e) {
    console.log('skuTap')
    if (this.data.selected_sku._id == e.currentTarget.dataset.skuId)
      return;
    let skus = this.data.current.skus
    let sku;
    if (skus.find) {
      sku = skus.find((o) => {
        return o._id == e.currentTarget.dataset.skuId
      });
    } else {
      for (let i = 0; i < skus.length; i++) {
        if (skus[i]._id == e.currentTarget.dataset.skuId) {
          sku = skus[i]
          break
        }
      }
    }
    this.setData({
      quantity: 1,
      selected_sku: sku
    });
    quantityRegulator.setMax(this.data.selected_sku.quantity);
  },
  openPickShippingInfoDialog: function () {
    var that = this;
    this.fetchMemberShippingInfos()
    this.setData({
      isShippingInfoPickContainerPopup: true,
      shippingInfoAnimationContentClass: 'spu-popup-container-content-fade-in'
    })
    setTimeout(() => {
      that.setData({
        shippingInfoAnimationMaskClass: 'spu-popup-container-mask-fade-in'
      })
    }, 300);
  },
  closePickShippingInfoDialog: function () {
    if (this.data.isShippingInfoPickContainerPopup) {
      var that = this;
      this.setData({
        shippingInfoAnimationMaskClass: 'spu-popup-container-mask-fade-out',
        shippingInfoAnimationContentClass: 'spu-popup-container-content-fade-out'
      })
      setTimeout(() => {
        that.setData({
          isShippingInfoPickContainerPopup: false
        })
      }, 300);
    }
  },
  shippingInfoTap: function (e) {
    if (this.data.selectedShippingInfo && this.data.selectedShippingInfo._id == e.currentTarget.dataset.shippingInfoId)
      return;

    let memberShippingInfos = this.data.memberShippingInfos
    let shippingInfo
    if (memberShippingInfos.find) {
      shippingInfo = memberShippingInfos.find((o) => {
        return o._id == e.currentTarget.dataset.shippingInfoId
      });
    } else {
      for (let i = 0; i < memberShippingInfos.length; i++) {
        if (memberShippingInfos[i]._id == e.currentTarget.dataset.shippingInfoId) {
          shippingInfo = memberShippingInfos[i]
          break
        }
      }
    }
    this.setData({
      selectedShippingInfo: shippingInfo
    });
  },
  spuPanTouchStart: function (e) {
    this.setData({
      startPoint: [e.touches[0].pageX, e.touches[0].pageY]
    })
  },
  spuPanTouchMove: function (e) {
    var curPoint = [e.touches[0].pageX, e.touches[0].pageY];
    var startPoint = this.data.startPoint;
    var deltaX = Math.abs(curPoint[0] - startPoint[0]);
    var deltaY = Math.abs(curPoint[1] - startPoint[1]);
    if (deltaX < deltaY) {
      // 在Y轴上变动大大
      if (curPoint[1] < startPoint[1]) {
        this.setData({
          spuPanDeltaUpY: deltaY
        });
        console.log(e.timeStamp + ' - touch up move');
      } else {
        this.setData({
          spuPanDeltaDownY: deltaY
        });
        console.log(e.timeStamp + ' - touch down move');
      }
    }
  },
  spuPanTouchEnd: function (e) {
    var that = this;
    var isPanUp = e.currentTarget.dataset.isPanUp;
    console.log('isPanUp: ' + e.currentTarget.dataset.isPanUp);
    if (isPanUp && this.data.spuPanDeltaUpY > this.data.spuPanThreshold) {
      //上拉图片详情
      console.log('end up ' + this.data.spuPanDeltaUpY);
      console.log('上拉图片详情');
      that.setData({
        isPageIntroUrlShow: true,
        isPageInfoShow: false,
        pageInfoAnimationClass: 'spu-details-page-info-fade-out',
        pageIntroUrlAnimationClass: 'spu-details-page-intro-url-fade-in'
      });
    } else if (!isPanUp && this.data.spuPanDeltaDownY > this.data.spuPanThreshold) {
      //下拉产品介绍
      console.log('end down ' + this.data.spuPanDeltaDownY);
      console.log('下拉产品介绍');
      that.setData({
        isPageIntroUrlShow: false,
        isPageInfoShow: true,
        pageInfoAnimationClass: 'spu-details-page-info-fade-in',
        pageIntroUrlAnimationClass: 'spu-details-page-intro-url-fade-out'
      });
    }
  },
  addNewShippingInfo: function () {
    console.log('addNewShippingInfo...')
    this.setData({
      isWaitAddNewShippingInfo: true
    })
    wx.navigateTo({
      url: '../mine/shipping-details?needNavigationBack=true'
    })
    
  },
  fetchMemberShippingInfos: function () {
    let that = this
    app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'shippings', { open_id: app.getSession().openid, tenantId: app.config[keys.CONFIG_SERVER].getTenantId(), page: { size: 99, skip: 0 } }, (memberShippingInfos) => {
      console.log(memberShippingInfos)
      that.setData({
        memberShippingInfos
      });
    })
  },
  fetchDefaultShippingInfo: function () {
    let that = this
    app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'getDefaultShipping', { open_id: app.getSession().openid, tenantId: app.config[keys.CONFIG_SERVER].getTenantId()}, (defaultShipping) => {
      that.setData({
        selectedShippingInfo: defaultShipping
      });
    })
  },
  fetchData: function (id) {
    let that = this
    app.libs.http.get(app.config[keys.CONFIG_SERVER].getBizUrl() + 'spu/' + id, (spu) => {
      that.setData({
        current: spu,
        selected_sku: spu.default_selected_sku || {}
      });
      quantityRegulator.setMax(that.data.selected_sku.quantity);
    })
  },
  onLoad: function (options) {
    console.log('spu-details onLoad' + options.spuId)
    let that = this
    wx.getSystemInfo({
      success: function (ret) {
        that.setData({
          windowHeight: ret.windowHeight - 45
        })
      }
    })

    app.toast.init(this)
    quantityRegulator.init(this)
    this.fetchData(options.spuId)
    this.fetchDefaultShippingInfo()
  }
})