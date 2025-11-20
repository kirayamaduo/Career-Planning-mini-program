Page({
  data: {
    traits: ['逻辑强', '创新者', '同理心', '执行力'],
    radarData: [80, 65, 90, 75, 85] // 对应不同维度的百分比
  },

  onBack() {
    wx.navigateBack({ delta: 2 }); // 返回到assessment主页
  },
  
  goToDetail() {
    wx.navigateTo({
      url: '/pages/assessment/career-detail/index?id=1',
    })
  }
})