module.exports = {
    init: function(page, {max=1}= {}){
        this.page = page;
        this.max = max;
        this.page.minus = this.minus.bind(this);
        this.page.plus = this.plus.bind(this);
        this.page.setQuantityRegulator = this.setQuantityRegulator.bind(this);
    },
    setMax: function (max = 1) {
        this.max = max;
    },
    minus: function({step = 1} = {}) {
        let newValue = this.page.data.quantity - step;
        newValue < 1 && (newValue = 1);
        this.page.setData({
            quantity: newValue
        });
    },
    plus: function({step = 1} = {}) {
        console.log(345);
        let newValue = this.page.data.quantity + step;
        newValue > this.max && (newValue = this.max);
        this.page.setData({
            quantity: newValue
        });
    },
    setQuantityRegulator: function (e) {
        let newValue = new Number(e.detail.value);
        if (!newValue || newValue < 1 || newValue > this.max) {
            return;
        }
        this.page.setData({
            quantity: newValue
        });
    }
}