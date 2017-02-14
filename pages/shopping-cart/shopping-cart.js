import keys from '../../config/keys.js'
import settings from '../../config/settings.js'
import quantityRegulator from '../../components/quantity-regulator/quantity-regulator'
//获取应用实例
var app = getApp();
// var  selectedAllStatus = false;
Page({
    data: {
        selectedAllStatus: false,
        selected: [],
        cartChecked: [],
        groupCheckCount: 0,
        amount: 0,
        ischooseAll: 0,
        shopping_cart: []
    },
    //事件处理函数
    bindCheckAddrbox: function (e) {
        console.log('bindCheckAddrbox ');
        let idx = e.currentTarget.dataset.groupIndex
        let cartChecked = this.data.cartChecked
        let groupCheck = cartChecked[idx]['self']
        groupCheck = !groupCheck
        for (let k2 in cartChecked[idx]) {
            cartChecked[idx][k2] = groupCheck
            console.log("cartChecked[k]['self']:" + cartChecked[idx][k2])
        }
        let groupCheckCount = this.groupCheckCount()
        this.setData({
            cartChecked,
            groupCheckCount
        })
        console.log(cartChecked)
        this.calculateAmount()
    },
    doSettlement: function () {
        console.log("结算");
        if (this.data.groupCheckCount === 0) {
            app.toast.showError('至少选择一样商品结算')
            return
        }

        if (this.data.groupCheckCount > 1) {
            app.toast.showError('同一地址的商品才支持合并订单')
            return
        }
        let cartChecked = this.data.cartChecked
        let amount = this.data.amount;
        let shopping_cart = this.data.shopping_cart
        let checkedShoppingItems = []
        let shipping_info
        for (let k in cartChecked) {
            if (cartChecked[k]['self']) {
                shipping_info = shopping_cart[k].group
                for (let k2 in cartChecked[k]) {
                    if (k2 !== 'self' && cartChecked[k][k2]) {
                        console.log(shopping_cart[k])
                        let shoppingItem = shopping_cart[k].items[k2]
                        checkedShoppingItems.push(shoppingItem)
                    }
                }
            }
        }

        wx.setStorage({
            key: keys.STG_ORDER_CONFIRM_NOW,
            data: {
                shipping_info,
                items: checkedShoppingItems,
                amount: new Number(amount).toFixed(2),
                shipping_fee: new Number(0).toFixed(2)
            },
            success: function (res) {
                // success
                wx.navigateTo({
                    url: '../store/order-confirm'
                });
            },
            fail: function (err) {
                // fail
                console.log(err);
                app.toast.show(err, { icon: 'warn', duration: 1500 })
            }
        })

        console.log(amount);
    },
    removecCart: function (e) {
        console.log("删除");
        let that = this
        let idx = e.currentTarget.dataset.groupIndex
        let idx2 = e.currentTarget.dataset.itemIndex
        let shopping_cart = this.data.shopping_cart
        let cartChecked = this.data.cartChecked
        wx.showActionSheet({
            itemList: ['删除后无法恢复，继续？'],
            itemColor: '#f00',
            success: function (res) {
                if (res.tapIndex == 0) {
                    console.log("确认删除");
                    if (shopping_cart[idx].items.length == 1) {
                        shopping_cart.splice(idx, 1);
                    } else {
                        shopping_cart[idx].items.splice(idx2, 1);
                    }
                    that.syncToStorage(shopping_cart);
                }
            }
        })
    },
    groupCheckCount: function () {
        let shopping_cart = this.data.shopping_cart
        let cartChecked = this.data.cartChecked
        let groupCheckCount = 0
        let previousGroup
        let isBreak = false
        for (let k in cartChecked) {
            for (let k2 in cartChecked[k]) {
                if (cartChecked[k][k2]) {
                    if (!previousGroup) {
                        previousGroup = shopping_cart[k].groupKey
                        console.log("previousGroup:" + previousGroup)
                    } else {
                        if (previousGroup !== shopping_cart[k].groupKey) {
                            isBreak = true
                            break

                        }
                    }
                }
            }
            if (isBreak) {
                break
            }
        }
        if (previousGroup) {
            if (!isBreak) {
                groupCheckCount = 1
            } else {
                groupCheckCount = 2
            }
        } else {
            groupCheckCount = 0
        }

        return groupCheckCount
    },
    calculateAmount: function () {
        let cartChecked = this.data.cartChecked
        let shopping_cart = this.data.shopping_cart
        let amount = 0
        for (let idx = 0; idx < shopping_cart.length; idx++) {
            let shoppingItems = shopping_cart[idx].items
            if (shoppingItems) {
                for (let idx2 = 0; idx2 < shoppingItems.length; idx2++) {
                    if (cartChecked[idx][idx2]) {
                        amount += shoppingItems[idx2].price * shoppingItems[idx2].quantity
                    }
                }
            }
        }
        this.setData({
            amount
        })
    },
    loadCheckState: function () {
        let cartChecked = this.data.cartChecked
        console.log('loadCheckState:')
        let shopping_cart = this.data.shopping_cart
        for (let idx = 0; idx < shopping_cart.length; idx++) {
            let shoppingItems = shopping_cart[idx].items
            if (shoppingItems) {
                cartChecked[idx] = {}
                let groupChecked = true
                for (let idx2 = 0; idx2 < shoppingItems.length; idx2++) {
                    cartChecked[idx][idx2] = shoppingItems[idx2].checked
                    groupChecked = groupChecked && cartChecked[idx][idx2]
                }
                cartChecked[idx]['self'] = groupChecked
            }
        }
        let groupCheckCount = this.groupCheckCount()
        this.setData({
            cartChecked,
            groupCheckCount
        })
        this.calculateAmount()
    },
    bindCheckAll: function () {
        console.log("开始的" + selectedAllStatus);
        console.log('bindSelectAll ');
        let selectedAllStatus = this.data.selectedAllStatus;
        selectedAllStatus = !selectedAllStatus;
        let cartChecked = this.data.cartChecked
        for (let k in cartChecked) {
            for (let k2 in cartChecked[k]) {
                cartChecked[k][k2] = selectedAllStatus
            }
        }
        let groupCheckCount = this.groupCheckCount()
        this.setData({
            selectedAllStatus,
            cartChecked,
            groupCheckCount
        })
        console.log(this.data.cartChecked)
        this.calculateAmount()
    },
    bindCheckbox: function (e) {
        let idx = e.currentTarget.dataset.groupIndex
        let idx2 = e.currentTarget.dataset.itemIndex
        let cartChecked = this.data.cartChecked
        cartChecked[idx][idx2] = !cartChecked[idx][idx2]
        let selectedAllStatus = true
        for (let k in cartChecked) {
            let groupChecked = true
            for (let k2 in cartChecked[k]) {
                console.log('k2: ' + cartChecked[k][k2])
                if (k2 !== 'self') {
                    groupChecked = groupChecked && cartChecked[k][k2]
                }
            }
            cartChecked[k]['self'] = groupChecked
            selectedAllStatus = selectedAllStatus && groupChecked
        }
        let groupCheckCount = this.groupCheckCount()
        console.log("groupCheckCount33:" + groupCheckCount)
        this.setData({
            selectedAllStatus,
            cartChecked,
            groupCheckCount
        })
        this.calculateAmount()
        let shopping_cart = this.data.shopping_cart
        if (shopping_cart[idx].items && shopping_cart[idx].items[idx2]) {
            shopping_cart[idx].items[idx2].checked = cartChecked[idx][idx2]
            this.syncToStorage(shopping_cart)
        }
    },
    syncToStorage: function (shopping_cart) {
        wx.setStorage({
            key: keys.STG_SHOPPING_CART,
            data: shopping_cart
        })
    },
    onLoad: function (options) {
        console.log('shopping-cart onLoad ');
        app.toast.init(this)
        let that = this;
        let shopping_cart = this.data.shopping_cart;
        console.log(JSON.stringify(shopping_cart))
        wx.getStorage({
            key: keys.STG_SHOPPING_CART,
            success: function (res) {
                // console.log(JSON.stringify(res.data))
                if (res.data) {
                    that.setData({
                        shopping_cart: res.data
                    })
                    that.loadCheckState()
                }
            }
        })
        quantityRegulator.init(this);


    }
})