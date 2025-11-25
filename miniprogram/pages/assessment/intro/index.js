Page({
  data: {
    id: '',
    title: '职业性格测评',
    desc: '基于 MBTI 与大五人格理论，AI 深度解析'
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        id: options.id,
        title: options.title || '职业测评',
        desc: options.desc || 'AI 深度解析你的职业潜力'
      });
    } else if (options.title) {
      // 如果只有 title (比如从旧入口进来)
      this.setData({
        title: options.title
      });
    }
  },

  startQuiz() {
    const url = this.data.id 
      ? `/pages/assessment/quiz/index?id=${this.data.id}`
      : '/pages/assessment/quiz/index';
      
    wx.navigateTo({
      url: url,
    }).catch(err => {
      console.error('Failed to navigate to quiz page:', err);
      wx.showToast({
        title: '跳转失败，请重试',
        icon: 'none'
      });
    });
  }
})