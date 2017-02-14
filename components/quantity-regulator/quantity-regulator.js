var QuantityRegulator = function (page, dataPath = 'quantity', {step = 1, max = 1} = {}) {
    this.page = page
    this.step = step
    this.max = max
    this.page.minus = this.minus.bind(this)
    this.page.plus = this.plus.bind(this)
    this.page.setQuantityRegulator = this.setQuantityRegulator.bind(this)
    this.dataPath = dataPath
    console.log(this.dataPath)
}
QuantityRegulator.prototype.setMax = function (max) {
    this.max = max
}
QuantityRegulator.prototype.minus = function (e) {
    let newValue = this.page.data.quantity - this.step
    newValue < 1 && (newValue = 1)
    let dataPath = this.dataPath
    this.page.setData({
        [`${dataPath}`]: newValue
    })
}
QuantityRegulator.prototype.plus = function (e) {
    let newValue = this.page.data.quantity + this.step;
    newValue > this.max && (newValue = this.max);
    let dataPath = this.dataPath
    this.page.setData({
        [`${dataPath}`]: newValue
    })
}
QuantityRegulator.prototype.setQuantityRegulator = function (e) {
    let newValue = new Number(e.detail.value);
    if (!newValue || newValue < 1 || newValue > this.max) {
        return;
    }
    let dataPath = this.dataPath
    this.page.setData({
        [`${dataPath}`]: newValue
    })
}
module.exports = QuantityRegulator