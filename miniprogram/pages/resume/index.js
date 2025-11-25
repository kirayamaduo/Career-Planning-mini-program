Page({
  data: {
    isPageActive: false
  },
  onShow() {
    this.setData({ isPageActive: true });
  },
  onHide() {
    this.setData({ isPageActive: false });
  }
})
