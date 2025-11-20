Page({
  data: {
    
  },

  onBack() {
    wx.navigateBack();
  },

  startQuiz() {
    // 点击开始按钮，跳转到之前的 Quiz 页面
    wx.redirectTo({
      url: '/pages/assessment/quiz/index',
    })
  }
})