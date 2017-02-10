var ShoppingCart = function (wx, cacheKey) {
    this.wx = wx
    this.cacheKey = cacheKey
    this.groupedItems = this.wx.getStorageSync(this.cacheKey) || []
}
ShoppingCart.prototype.getItemCount = function () {
    return this.groupedItems.reduce((totalOfGroup, group) => {
        return totalOfGroup + group.items.reduce((totalOfItem, item) => {
            return totalOfItem + item.quantity
        }, 0)
    }, 0)
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
            successFn()
        },
        fail: function (err) {
            console.log(err)
        }
    })
}
ShoppingCart.prototype.removeItem = function (groupComparator, itemComparator) {
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
    }
}
module.exports = ShoppingCart