Page({
  data: {

  },

  onLoad(options) {

  },

  startQuiz() {
    wx.navigateTo({
      url: '/pages/assessment/quiz/index',
    }).catch(err => {
      console.error('Failed to navigate to quiz page:', err);
      wx.showToast({
        title: '跳转失败，请重试',
        icon: 'none'
      });
    });
  }
})