Page({
  data: {
    isPageActive: false
  },
  onShow() {
    this.setData({ isPageActive: true });
  },
  onHide() {
    this.setData({ isPageActive: false });
  },
  
  // 跳转到新的测评介绍页
  goToQuizIntro() {
    wx.navigateTo({
      url: '/pages/assessment/intro/index',
    })
  },

  goToDetail() {
    wx.navigateTo({
      url: '/pages/assessment/career-detail/index?id=frontend',
    })
  }
})