var ShoppingCart = function (wx, cacheKey) {
    this.wx = wx
    this.cacheKey = cacheKey
    this.groupedItems = this.wx.getStorageSync(this.cacheKey) || []
}
ShoppingCart.prototype.refresh = function () {
    console.log('refresh')
    this.groupedItems = this.wx.getStorageSync(this.cacheKey) || []
    console.log(this.groupedItems)
}
ShoppingCart.prototype.getItemCount = function (quantityKey = 'quantity') {
    return this.groupedItems.reduce((totalOfGroup, group) => {
        console.log(group)
        return totalOfGroup + group.items.reduce((totalOfItem, item) => {
            console.log(totalOfItem)
            console.log(item[quantityKey])
            return totalOfItem + item[quantityKey]
        }, 0)
    }, 0)
}
ShoppingCart.prototype.update = function (groupedItems) {
    this.groupedItems = groupedItems
    this.wx.setStorage({
        key: this.cacheKey,
        data: groupedItems
    })
}
ShoppingCart.prototype.addItem = function (groupKey, group, groupComparator, newItem, itemComparator, mergeSameItemFn, successFn) {
    let groupedItems = this.groupedItems
    let groupedItem;
    if (typeof groupedItems.find === 'function') {
        groupedItem = groupedItems.find(groupComparator)
    } else {
        console.log('array no find method ')
        for (let i = 0; i < groupedItems.length; i++) {
            if (groupComparator(groupedItems[i])) {
                groupedItem = groupedItems[i]
                break
            }
        }
    }
    if (!groupedItem) {
        groupedItems.unshift({
            groupKey,
            group,
            items: [newItem]
        })
    } else {
        let item
        if (typeof groupedItem.items.find === 'function') {
            item = groupedItem.items.find(itemComparator)
        } else {
            for (let i = 0; i < groupedItem.items.length; i++) {
                if (itemComparator(groupedItem.items[i])) {
                    item = groupedItem.items[i]
                    break
                }
            }
        }
        if (!item) {
            groupedItem.items.unshift(newItem)
        } else {
            if (typeof mergeSameItemFn === 'function') {
                mergeSameItemFn(item, newItem)
            }
        }
    }

    this.wx.setStorage({
        key: this.cacheKey,
        data: groupedItems,
        success: function (res) {
            if (successFn && typeof successFn === 'function') {
                successFn()
            }
        },
        fail: function (err) {
            console.log(err)
        }
    })
}
ShoppingCart.prototype.removeItem = function (groupComparator, itemComparator, successFn) {
    let groupedItems = this.groupedItems
    let groupedIndex;
    if (typeof groupedItems.findIndex === 'function') {
        groupedIndex = groupedItems.findIndex(groupComparator)
    } else {
        console.log('array no find method ')
        for (groupedIndex; groupedIndex < groupedItems.length; groupedIndex++) {
            if (groupComparator(groupedItems[groupedIndex])) {
                break
            }
        }
    }
    let groupedItem = groupedItems[groupedIndex]
    if (groupedItem) {
        let removeItemIndex = -1
        if (typeof groupedItem.items.findIndex === 'function') {
            removeItemIndex = groupedItem.items.findIndex(itemComparator)
        } else {
            for (let i = 0; i < groupedItem.items.length; i++) {
                if (itemComparator(groupedItem.items[i])) {
                    removeItemIndex = i
                    break
                }
            }
        }
        if (removeItemIndex != -1) {
            groupedItem.items.splice(removeItemIndex, 1)
        }

        if (groupedItem.items.length === 0) {
            groupedItems.splice(groupedIndex, 1)
        }
    }

    console.log(groupedItems)

    this.wx.setStorage({
        key: this.cacheKey,
        data: groupedItems,
        success: function (res) {
            if (successFn && typeof successFn === 'function') {
                successFn()
            }
        },
        fail: function (err) {
            console.log(err)
        }
    })
}
module.exports = ShoppingCart