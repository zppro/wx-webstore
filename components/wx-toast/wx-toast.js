module.exports = {
    init: function(page){
        this.page = page;
    },
    show: function(msg, {icon = 'success', color="white", size="45", duration = false} = {}) {
        console.log(this);
        this.page.setData({
            toastOptions: {msg, icon, color, size, visiable: true }
        });
        duration && (this.hideId = setTimeout(this.hide.bind(this), duration));
    },
    hide: function() {
        if (this.hideId) {
            clearInterval(this.hideId);
        }
        this.page.setData({
            toastOptions: {
                visiable: false
            }
        })
    }
}