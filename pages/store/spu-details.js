import QuantityRegulator from '../../components/quantity-regulator/quantity-regulator'
import keys from '../../config/keys.js'
var app = getApp()
Page({
  data: {
    current: {},
    selected_sku: {quantity:0},
    quantity: 1,
    windowHeight: 627 - 45,
    shoppingCartItemCount: 0,
    selectedShippingInfo: {},
    memberShippingInfos: [],
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
    if (this.data.isWaitAddNewShippingInfo) {
      let that = this
      // this.fetchMemberShippingInfos()
      var memberShippingInfos = this.data.memberShippingInfos
      wx.getStorage({
        key: keys.STG_NEW_ADDED,
        success: function (res) {
          // success
          console.log(res.data)
          if (res.data) {
            memberShippingInfos.unshift(res.data)
            that.setData({
              selectedShippingInfo: res.data,
              memberShippingInfos,
              isWaitAddNewShippingInfo: false
            })
          }
        },
        fail: function (err) {
          // fail
          console.log(err);
        },
        complete: function () {
          wx.removeStorage({
            key: keys.STG_NEW_ADDED
          })
        }
      })
    }
  },
  //事件处理函数
  addToShoppingCart: function () {
    let spuInfo = this.getSPUInfo()
    if (!spuInfo) {
      return;
    }
    let that = this
    let shipping_info = this.data.selectedShippingInfo
      , groupKey = shipping_info._id
      , groupInfo = shipping_info
      , groupComparator = (groupItem) => {
        return groupItem.groupKey === shipping_info._id
      }
      , newItem = spuInfo
      , itemComparator = (item) => {
        return item.spu_id === spuInfo.spu_id && item.sku_id === spuInfo.sku_id
      }
      , mergeSameItemFn = (oldItem, newItem) => {
        oldItem.spu_name = newItem.spu_name
        oldItem.sku_name = newItem.sku_name
        oldItem.img = newItem.img
        oldItem.price = newItem.price
        oldItem.market_price = newItem.market_price
        oldItem.quantity = oldItem.quantity + newItem.quantity
      }
      , successFn = () => {
        that.setData({
          shoppingCartItemCount: app.shoppingCart.getItemCount()
        })
      }
    app.shoppingCart.addItem(groupKey, groupInfo, groupComparator, newItem, itemComparator, mergeSameItemFn, successFn)
  },
  buyNow: function () {
    let spuInfo = this.getSPUInfo()
    if (!spuInfo) {
      return;
    }
    let that = this
    wx.setStorage({
      key: keys.STG_ORDER_CONFIRM_NOW,
      data: {
        source: keys.ORDER_CONFIRM_SOURCE_SPU_DETAILS,
        shipping_info: this.data.selectedShippingInfo,
        items: [spuInfo],
        amount: new Number(spuInfo.price * spuInfo.quantity).toFixed(2),
        shipping_fee: new Number(0).toFixed(2)
      },
      success: function (res) {
        // success
        that.toOrderConfirm()
      },
      fail: function (err) {
        // fail
        console.log(err);
        app.toast.show(err, { icon: 'warn', duration: 1500 })
      }
    })
  },
  getSPUInfo: function () {
    if (!this.checkData()) {
      return null
    }
    let spu = this.data.current
    let sku = this.data.selected_sku
    let quantity = this.data.quantity
    return {
      spu_id: spu.id,
      spu_name: spu.name,
      sku_id: sku._id,
      sku_name: sku.name,
      img: spu.img,
      price: sku.sale_price,//下单单价 单位元
      market_price: sku.market_price,
      quantity: quantity//数量
    }
  },
  toOrderConfirm: function () {
    wx.navigateTo({
      url: './order-confirm'
    })
  },
  checkData: function () {
    if (!this.data.selectedShippingInfo || app.util.isEmpty(this.data.selectedShippingInfo.id)) {
      this.openPickShippingInfoDialog()
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
    })
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
        })
        // console.log(e.timeStamp + ' - touch up move');
      } else {
        this.setData({
          spuPanDeltaDownY: deltaY
        })
        // console.log(e.timeStamp + ' - touch down move');
      }
    }
  },
  spuPanTouchEnd: function (e) {
    var that = this;
    var isPanUp = e.currentTarget.dataset.isPanUp;
    console.log('isPanUp: ' + e.currentTarget.dataset.isPanUp);
    if (isPanUp && this.data.spuPanDeltaUpY > this.data.spuPanThreshold) {
      //上拉图片详情
      // console.log('end up ' + this.data.spuPanDeltaUpY)
      // console.log('上拉图片详情')
      that.upTap()
    } else if (!isPanUp && this.data.spuPanDeltaDownY > this.data.spuPanThreshold) {
      //下拉产品介绍
      // console.log('end down ' + this.data.spuPanDeltaDownY)
      // console.log('下拉产品介绍')
      that.downTap()
    }
  },
  upTap: function () {
    this.setData({
      isPageIntroUrlShow: true,
      isPageInfoShow: false,
      pageInfoAnimationClass: 'spu-details-page-info-fade-out',
      pageIntroUrlAnimationClass: 'spu-details-page-intro-url-fade-in'
    })
  },
  downTap: function () {
    this.setData({
      isPageIntroUrlShow: false,
      isPageInfoShow: true,
      pageInfoAnimationClass: 'spu-details-page-info-fade-in',
      pageIntroUrlAnimationClass: 'spu-details-page-intro-url-fade-out'
    })
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
    console.log(app.getSession())
    app.libs.http.post(app.config[keys.CONFIG_SERVER].getBizUrl() + 'getDefaultShipping', { open_id: app.getSession().openid, tenantId: app.config[keys.CONFIG_SERVER].getTenantId() }, (defaultShipping) => {
      that.setData({
        selectedShippingInfo: defaultShipping
      });
    })
  },
  fetchData: function (id) {
    let that = this
    app.libs.http.get(app.config[keys.CONFIG_SERVER].getBizUrl() + 'spu/' + id, (spu) => {
      wx.setNavigationBarTitle({
        title: spu.name
      })
      that.setData({
        current: spu,
        selected_sku: spu.default_selected_sku || {}
      })
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
    this.quantityRegulator = new QuantityRegulator(that)
    this.setData({
      shoppingCartItemCount: app.shoppingCart.getItemCount()
    })
    this.fetchData(options.spuId)
    this.fetchDefaultShippingInfo()
  }
})