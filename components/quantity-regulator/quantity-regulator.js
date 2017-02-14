var QuantityRegulator = function (page, {changedId = null, onChanged = null} = {}) {
    this.page = page
    this.page.minus = this.minus.bind(this)
    this.page.plus = this.plus.bind(this)
    this.page.setQuantityRegulator = this.setQuantityRegulator.bind(this)
    if (changedId && onChanged && typeof onChanged === 'function') {
        this.onChangedListeners[changedId] = onChanged
    }
}
QuantityRegulator.prototype.onChangedListeners = {}
QuantityRegulator.prototype.setOnChanged = function (changedId, onChanged) {
    if (changedId && onChanged && typeof onChanged === 'function') {
        this.onChangedListeners[changedId] = onChanged
    }
}
QuantityRegulator.prototype.minus = function (e) {
    let quantity = e.currentTarget.dataset.quantity
    let step = e.currentTarget.dataset.step
    let path = e.currentTarget.dataset.path
    let changedId = e.currentTarget.dataset.changedId || 'changedId'
    let newValue = quantity - step
    newValue < 1 && (newValue = 1)
    this.page.setData({
        [`${path}`]: newValue
    })
    if (quantity !== newValue && this.onChangedListeners[changedId]) {
        this.onChangedListeners[changedId](quantity, newValue)
    }
}
QuantityRegulator.prototype.plus = function (e) {
    let quantity = e.currentTarget.dataset.quantity
    let step = e.currentTarget.dataset.step
    let max = e.currentTarget.dataset.max
    let path = e.currentTarget.dataset.path
    let changedId = e.currentTarget.dataset.changedId || 'changedId'
    let newValue = quantity + step
    max > 0 && newValue > max && (newValue = max)
    this.page.setData({
        [`${path}`]: newValue
    })
    if (quantity !== newValue && this.onChangedListeners[changedId]) {
        this.onChangedListeners[changedId](quantity, newValue)
    }
}
QuantityRegulator.prototype.setQuantityRegulator = function (e) {
    let newValue = new Number(e.detail.value);
    let max = e.currentTarget.dataset.max
    let path = e.currentTarget.dataset.path
    let changedId = e.currentTarget.dataset.changedId || 'changedId'
    if (!newValue || newValue < 1 || newValue > max) {
        return;
    }
    this.page.setData({
        [`${path}`]: newValue
    })
    if (quantity !== newValue && this.onChangedListeners[changedId]) {
        this.onChangedListeners[changedId](quantity, newValue)
    }
}
module.exports = QuantityRegulator