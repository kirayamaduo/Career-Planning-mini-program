Page({
  data: {
    isPageActive: false,
    tasks: [],
    isLoading: true
  },
  onShow() {
    this.setData({ isPageActive: true });
    this.fetchTasks();
  },
  onHide() {
    this.setData({ isPageActive: false });
  },

  fetchTasks() {
    const db = wx.cloud.database();
    db.collection('assessment_tasks').get().then(res => {
      this.setData({
        tasks: res.data,
        isLoading: false
      });
    }).catch(err => {
      console.error('Failed to fetch tasks', err);
      this.setData({ isLoading: false });
    });
  },

  handleTaskClick(e) {
    const { status } = e.currentTarget.dataset;
    if (status === 'active') {
      wx.navigateTo({
        url: '/pages/assessment/intro/index',
      });
    } else {
      wx.showToast({
        title: '暂未解锁',
        icon: 'none'
      });
    }
  },
  
  // 跳转到新的测评介绍页 (Hero Card 使用)
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
