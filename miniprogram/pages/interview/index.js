Page({
  data: {
    isPageActive: false,
    interviewHistory: [],
    pausedInterview: null,
    hasOngoingInterview: false
  },

  onShow() {
    this.setData({ isPageActive: true });
    this.loadInterviewHistory();
  },

  onHide() {
    this.setData({ isPageActive: false });
  },

  // Load interview history from database
  async loadInterviewHistory() {
    try {
      const db = wx.cloud.database();
      
      // Check for paused interview
      const pausedRes = await db.collection('interviews')
        .where({ status: 'paused' })
        .orderBy('updateTime', 'desc')
        .limit(1)
        .get();
      
      if (pausedRes.data && pausedRes.data.length > 0) {
        const paused = pausedRes.data[0];
        this.setData({
          pausedInterview: {
            _id: paused._id,
            position: paused.position,
            level: paused.level,
            type: paused.type,
            positionName: this.getPositionName(paused.position),
            questionCount: paused.messages ? paused.messages.filter(m => m.role === 'ai').length : 0
          }
        });
      }
      
      // Load completed interviews
      const res = await db.collection('interviews')
        .where({ status: 'completed' })
        .orderBy('createTime', 'desc')
        .limit(10)
        .get();
      
      // Format data for display
      const history = res.data.map(item => ({
        _id: item._id,
        positionName: this.getPositionName(item.position),
        positionIcon: this.getPositionIcon(item.position),
        levelName: item.level,
        typeName: this.getTypeName(item.type),
        createTime: this.formatDate(item.createTime)
      }));
      
      this.setData({ interviewHistory: history });
    } catch (error) {
      console.error('Failed to load interview history:', error);
    }
  },

  // Enter interview (navigate to setup page)
  enterInterview() {
    wx.navigateTo({
      url: '/pages/interview/setup/index'
    });
  },

  // Continue paused interview
  continueInterview() {
    const paused = this.data.pausedInterview;
    if (paused) {
      wx.navigateTo({
        url: `/pages/interview/chat/index?position=${paused.position}&level=${paused.level}&type=${paused.type}&resumeId=${paused._id}`
      });
    }
  },

  // View history result
  viewHistory(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/interview/result/index?id=${id}`
    });
  },

  // Helper functions
  getPositionName(id) {
    const map = {
      'frontend': '前端开发',
      'backend': '后端开发',
      'product': '产品经理',
      'design': 'UI设计',
      'operation': '运营',
      'other': '其他'
    };
    return map[id] || id;
  },

  getPositionIcon(id) {
    const map = {
      'frontend': '💻',
      'backend': '⚙️',
      'product': '📱',
      'design': '🎨',
      'operation': '📊',
      'other': '💼'
    };
    return map[id] || '💼';
  },

  getTypeName(id) {
    const map = {
      'technical': '技术面',
      'comprehensive': '综合面',
      'hr': 'HR面'
    };
    return map[id] || id;
  },

  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  }
})