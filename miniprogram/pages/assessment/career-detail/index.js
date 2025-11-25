Page({
  data: {
    isLoading: true,
    career: null, // 初始为 null
    errorMsg: ''
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.fetchCareerDetail(id);
    } else {
      // 兼容调试：如果没有 ID，尝试加载默认的 frontend
      this.fetchCareerDetail('frontend');
    }
  },

  onBack() {
    wx.navigateBack();
  },

  fetchCareerDetail(code) {
    const db = wx.cloud.database();
    
    // 根据 code 字段查询 career_paths 集合
    db.collection('career_paths')
      .where({ code: code })
      .get()
      .then(res => {
        if (res.data && res.data.length > 0) {
          const careerData = res.data[0];
          
          this.setData({
            career: careerData,
            isLoading: false
          });
        } else {
          this.setData({
            isLoading: false,
            errorMsg: '暂无该职业的详细数据'
          });
          wx.showToast({
            title: '未找到职业数据',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('Failed to fetch career detail', err);
        this.setData({
          isLoading: false,
          errorMsg: '加载失败，请稍后重试'
        });
      });
  },

  // 开启学习计划 (交互反馈)
  startPlan() {
    wx.showToast({
      title: '已添加到学习计划',
      icon: 'success',
      duration: 2000
    });
    // 这里后续可以接跳转逻辑，比如 wx.switchTab 跳转到"学习" tab
  }
})