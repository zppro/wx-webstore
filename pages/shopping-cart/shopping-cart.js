import keys from '../../config/keys.js'
import settings from '../../config/settings.js'
import quantityRegulator from '../../components/quantity-regulator/quantity-regulator'
//获取应用实例
var app = getApp()
Page({
    data: {
        selectedAllStatus:'',
        count: 0,
        number: 0,
        carts: [{ id: '1', img: 'test1', spu_name: 'testname1', spu_type: '默认', spu_price: '28600', quantity: '1' }, { id: '2', img: 'test2', spu_name: 'testname2', spu_type: '默认', spu_price: '28600', quantity: '2' }],
    },
    //事件处理函数
    bindSelectAll: function () {
        console.log('bindSelectAll ');
        var selectedAllStatus = this.data.selectedAllStatus;
          console.log(selectedAllStatus);
        selectedAllStatus = !selectedAllStatus;
         console.log(selectedAllStatus);
        var carts = this.data.carts;
        if (!selectedAllStatus) {
            for (var i = 0; i < carts.length; i++) {
                console.log(selectedAllStatus);
                carts[i].selected = selectedAllStatus;
                // var num = parseInt(this.data.carts[i].num);
                // var price = parseInt(this.data.carts[i].price);
                this.setData({
                    // count: this.data.count - num * price,
                    // number: this.data.number - num
                      carts
                });
            }
        }else{
           
        }
    },
    bindCheckbox: function (e) {
        console.log('bindCheckbox ');
        let that = this
        let cartId = e.currentTarget.dataset.cartId
        console.log(cartId);
         var carts = this.data.carts;
        for (let i = 0; i < carts.length; i++) {
            if (carts[i].selected) {
                carts[i].selected = false
                break
            }
        }
        for (let i = 0; i < carts.length; i++) {
            if (carts[i].id == cartId) {
                carts[i].selected = true
                break
            }
        }
        that.setData({
            carts
        })
    },
    onLoad: function (options) {
        console.log('invoice-list onLoad ');
        quantityRegulator.init(this)
    }
})