import keys from '../../config/keys.js'
import settings from '../../config/settings.js'
import quantityRegulator from '../../components/quantity-regulator/quantity-regulator'
//获取应用实例
var app = getApp();
// var  selectedAllStatus = false;
Page({
    data: {
       selectedAllStatus: false,
        count: 0,
        number: 0,
        ischooseAll:0,
        carts: [{ id: '0', img: 'test1', spu_name: 'testname1', spu_type: '默认', spu_price: '28600',market_price:'28600', quantity: '1',selected:'true' }, { id: '1', img: 'test2', spu_name: 'testname2', spu_type: '默认', spu_price: '28600',market_price:'28700', quantity: '2', selected:'false'}],
    },
    //事件处理函数
    setAccounts:function(){
        console.log("结算");
        let count = this.data.count;
        let carts = this.data.carts;
        for(var i=0;i<carts.length;i++){
            if(!carts[i].selected){
                console.log("结算"+carts[i].id+":"+carts[i].selected);
                   wx.setStorage({
                        key: keys.ORDER_CONFIRM_NOW,
                        data: {
                        // shipping_info: this.data.selectedShippingInfo,
                        items: [{
                            spu_id: carts[i].id,
                            spu_name: carts[i].spu.name,
                            sku_id: carts[i].sku._id,
                            sku_name: carts[i].sku.name,
                            img: carts[i].spu.img,
                            price: carts[i].sku.sale_price,//下单单价 单位元
                            market_price: carts[i].sku.market_price,
                            quantity: carts[i].quantity//数量
                        }],
                        amount: new Number(count).toFixed(2),
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
                  wx.removeStorage({
                            key: 'key',
                            success: function(res) {
                                console.log(res.data)
                                this.setData({
                                    carts
                                });
                            } 
                      });
            }
        };
        console.log(count);
    },
    removecCart:function(e){
        console.log("删除");
         let that = this
        let cartId = e.currentTarget.dataset.cartId
        wx.showActionSheet({
            itemList: ['删除后无法恢复，继续？'],
            itemColor: '#f00',
            success: function (res) {
                if (res.tapIndex == 0) {
                      console.log("确认删除");
                      wx.removeStorage({
                            key: 'key',
                            success: function(res) {
                                console.log(res.data)
                                this.setData({
                                    carts
                                });
                            } 
                      });
                }
            }
        })
    },
    bindSelectAll: function () {
        console.log("开始的"+selectedAllStatus);
        console.log('bindSelectAll ');
        var selectedAllStatus = this.data.selectedAllStatus;
        let carts = this.data.carts;
         selectedAllStatus = !selectedAllStatus;
         let ischooseAll=this.data.ischooseAll;
         this.setData({
              selectedAllStatus:selectedAllStatus
         });
         console.log(selectedAllStatus);
        if (selectedAllStatus) {
            for (var i = 0; i < carts.length; i++) {
                 console.log("选中"+selectedAllStatus);
                  console.log("购物车长度"+carts);
               if(carts[i].selected){
                     console.log("是否选中"+carts[i].selected);
                    var num = parseInt(this.data.carts[i].quantity);
                    var price = parseInt(this.data.carts[i].spu_price);
                    ischooseAll= carts.length;
                    carts[i].selected = !selectedAllStatus;  
                    this.setData({
                        count: this.data.count + num * price,
                        number: this.data.number + num,
                        ischooseAll:ischooseAll,
                        carts
                        });
                   }            
                   console.log(i+"选中"+carts[i].selected);            
            }
           
        }else{
            for (var i = 0; i < carts.length; i++) {
                console.log("未选中"+selectedAllStatus);
                carts[i].selected = !selectedAllStatus;
                 var num = parseInt(this.data.carts[i].quantity);
                 var price = parseInt(this.data.carts[i].spu_price);
                 ischooseAll=0;
                this.setData({
                    count: this.data.count - num * price,
                    number: this.data.number - num,
                    carts,
                    ischooseAll:ischooseAll
                });
            }
            console.log("未选中"+selectedAllStatus);
        }
    },
    bindCheckbox: function (e) {
        console.log('bindCheckbox ');
        var selectedAllStatus = this.data.selectedAllStatus;
        selectedAllStatus = false;
        let that = this
        let cartId = e.currentTarget.dataset.cartId
        let ischooseAll=this.data.ischooseAll;
        console.log(cartId);
         var carts = this.data.carts;
        var selected =this.data.carts[cartId].selected;
        selected = !selected;
         console.log("选中"+selected);
        var num = parseInt(this.data.carts[cartId].quantity);
        var price = parseInt(this.data.carts[cartId].spu_price);
         console.log('价格 '+price);
         for(var i=0;i<carts.length;i++){
             if(carts[i].id == cartId){
                if(!carts[i].selected){
                        carts[i].selected = true;
                        this.setData({
                                ischooseAll:--ischooseAll
                       });
                         console.log("ischooseAll-"+ischooseAll);
                         this.setData({
                                selectedAllStatus:false,
                            });
                        var num = parseInt(this.data.carts[i].quantity);
                        var price = parseInt(this.data.carts[i].spu_price);
                        that.setData({
                            count: this.data.count - num * price,
                            number: this.data.number - num,
                            carts
                        });
                }else{
                    carts[i].selected = false;
                       console.log("ischooseAll+"+ischooseAll);
                       this.setData({
                                ischooseAll:++ischooseAll
                       });
                        if(ischooseAll == carts.length){
                            this.setData({
                                selectedAllStatus:true,
                               
                            });
                        }
                    that.setData({
                        count: this.data.count + num * price,
                        number: this.data.number + num,
                        carts,
                    });
                }
             }
      }
    },
    onLoad: function (options) {
        console.log('shopping-cart onLoad ');
        quantityRegulator.init(this);
    }
})