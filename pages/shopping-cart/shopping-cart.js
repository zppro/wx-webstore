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
        carts: [{ id: '0', img: 'test1', spu_name: 'testname1', spu_type: '默认', spu_price: '28600', quantity: '1',selected:'false' }, { id: '1', img: 'test2', spu_name: 'testname2', spu_type: '默认', spu_price: '28600', quantity: '2', selected:'false'}],
    },
    //事件处理函数
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
         console.log("未选中"+selected);
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
        console.log('invoice-list onLoad ');
        quantityRegulator.init(this);
    }
})