Page({
  data: {
    statusBarHeight: 20,
    navHeight: 0,
    
    loading: true,
    interviewId: '',
    
    // Result data
    score: 0,
    grade: '',
    gradeText: '',
    dimensions: [],
    feedback: '',
    suggestions: []
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    const statusBarHeight = sysInfo.statusBarHeight;
    const menuButton = wx.getMenuButtonBoundingClientRect();
    const navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height + statusBarHeight;

    this.setData({
      statusBarHeight,
      navHeight: navBarHeight,
      interviewId: options.id
    });

    if (options.id) {
      this.loadResult(options.id);
    }
  },

  async loadResult(interviewId) {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('interview_results')
        .where({ interviewId: interviewId })
        .get();
      
      if (res.data && res.data.length > 0) {
        const result = res.data[0];
        this.setData({
          loading: false,
          score: result.score || 0,
          grade: result.grade || 'B',
          gradeText: result.gradeText || '良好',
          dimensions: result.dimensions || [],
          feedback: result.feedback || '',
          suggestions: result.suggestions || []
        });
      } else {
        throw new Error('未找到评价结果');
      }
    } catch (error) {
      console.error('Failed to load result:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  handleBack() {
    wx.navigateBack();
  },

  startAgain() {
    wx.redirectTo({
      url: '/pages/interview/setup/index'
    });
  },

  backToHome() {
    wx.switchTab({
      url: '/pages/interview/index'
    });
  },

  async viewConversation() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const db = wx.cloud.database();
      const res = await db.collection('interviews').doc(this.data.interviewId).get();
      
      wx.hideLoading();
      
      if (res.data && res.data.messages) {
        const messages = res.data.messages.filter(m => !m.isThinking && !m.isError);
        
        // Navigate to conversation detail page instead of modal
        wx.navigateTo({
          url: `/pages/interview/conversation/index?id=${this.data.interviewId}`
        });
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  }
});

