import quantityRegulator from '../../components/quantity-regulator/quantity-regulator'
import keys from '../../config/keys.js'
var app = getApp()
Page({
  data: {
    current: {},
    selected_sku: {},
    quantity: 1,
    windowHeight: 627 - 45,
    selectedShippingPlace: {
      _id: '1',
      province: '浙江',
      city: '杭州市',
      area: '余杭区',
      address: '余杭镇XX小区1-3-102'
    },
    memberShippingPlaces: [
      {_id: '1', province: '浙江', city: '杭州市', area: '余杭区', address: '余杭镇XX小区1-3-102'},
      {_id: '2', province: '浙江', city: '湖州市', area: '吴兴区', address: '城区XX小区1-3-303'},
      {_id: '3', province: '浙江', city: '湖州市', area: '吴兴区', address: '城区YY小区12-1-502'}
    ],
    isPageInfoShow: true,
    isPageIntroUrl: false,
    pageInfoAnimationClass: '',
    pageIntroUrlAnimationClass: '',
    isSKUSContainerPopup: false,
    isShppingPlacePickContainerPopup: false,
    skusAnimationMaskClass: '',
    skusAnimationContentClass: '',
    shppingPlaceAnimationMaskClass: '',
    shppingPlaceAnimationContentClass: '',
    startPoint: [0, 0],
    spuPanDeltaUpY: 0,
    spuPanDeltaDownY: 0,
    spuPanThreshold: 100
  },
  //事件处理函数
  buyNow: function (){

  },
  openChangeSKUDialog: function () {
    var that = this;
    this.setData({
      isSKUSContainerPopup: true,
      skusAnimationContentClass: 'spu-popup-container-content-fade-in'
    })
    setTimeout(()=>{
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
      setTimeout(()=>{
        that.setData({
          isSKUSContainerPopup: false
        })
      }, 300);
    }
  },
  skuTap: function (e) {
    if (this.data.selected_sku._id == e.currentTarget.dataset.skuId) 
      return;

    let sku = this.data.current.skus.find((o)=>{
      return o._id == e.currentTarget.dataset.skuId
    });
    
    this.setData({
      quantity: 1,
      selected_sku: sku
    });
    quantityRegulator.setMax(this.data.selected_sku.quantity);
  },
  openPickShppingPlaceDialog: function () {
      var that = this;
      this.setData({
        isShppingPlacePickContainerPopup: true,
        shppingPlaceAnimationContentClass: 'spu-popup-container-content-fade-in'
      })
      setTimeout(()=>{
        that.setData({
          shppingPlaceAnimationMaskClass: 'spu-popup-container-mask-fade-in'
        })
      }, 300);
  },
  closePickShippingPlaceDialog: function () {
    if (this.data.isShppingPlacePickContainerPopup) {
      var that = this;
      this.setData({
        shppingPlaceAnimationMaskClass: 'spu-popup-container-mask-fade-out',
        shppingPlaceAnimationContentClass: 'spu-popup-container-content-fade-out'
      })
      setTimeout(()=>{
        that.setData({
          isShppingPlacePickContainerPopup: false
        })
      }, 300);
    }
  },
  shippingPlaceTap: function (e) {
    if (this.data.selectedShippingPlace._id == e.currentTarget.dataset.shippingPlaceId) 
      return;

    let shippingPlace = this.data.memberShippingPlaces.find((o)=>{
      return o._id == e.currentTarget.dataset.shippingPlaceId
    });
    
    this.setData({
      selectedShippingPlace: shippingPlace
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
  addNewShippingPlace: function () {
    console.log('addNewShippingPlace...')
  },
  onLoad: function (options) {
    var that = this;
    console.log('spu-details onLoad' + options.spuId)
    wx.getSystemInfo({
      success: function(ret) { 
        that.setData({
          windowHeight: ret.windowHeight - 45
        });
      }
    })
    
    app.toast.init(this);
    quantityRegulator.init(this);
    app.libs.http.get(app.config[keys.CONFIG_SERVER].root + 'spu/' + options.spuId, (spu)=>{
      console.log(spu);
      that.setData({
        current: spu,
        selected_sku: spu.default_selected_sku || {}
      });
      quantityRegulator.setMax(that.data.selected_sku.quantity);
    });
  }
})