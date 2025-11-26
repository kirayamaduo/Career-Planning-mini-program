Page({
  data: {
    statusBarHeight: 20,
    navHeight: 0,
    
    positions: [
      { id: 'frontend', name: '前端开发', icon: '💻' },
      { id: 'backend', name: '后端开发', icon: '⚙️' },
      { id: 'product', name: '产品经理', icon: '📱' },
      { id: 'design', name: 'UI设计', icon: '🎨' },
      { id: 'operation', name: '运营', icon: '📊' },
      { id: 'other', name: '其他', icon: '💼' }
    ],
    
    levels: ['初级', '中级', '高级'],
    
    types: [
      { id: 'technical', name: '技术面', desc: '考察专业技能' },
      { id: 'comprehensive', name: '综合面', desc: '综合能力评估' },
      { id: 'hr', name: 'HR面', desc: '了解求职意向' }
    ],
    
    modes: [
      { 
        id: 'practice', 
        name: '练习模式', 
        icon: '🎯',
        desc: '随时可以重新开始，没有压力的训练环境',
        features: ['可暂停', '无时间限制', '友好反馈'],
        recommended: true
      },
      { 
        id: 'formal', 
        name: '正式模式', 
        icon: '⚡',
        desc: '模拟真实面试环境，考验临场反应能力',
        features: ['有时间压力', '更严格评价', '真实感强'],
        recommended: false
      },
      { 
        id: 'chat', 
        name: '自由对话', 
        icon: '💬',
        desc: '轻松聊天，随意交流，像和朋友讨论一样',
        features: ['随意聊天', '无评分', '轻松氛围'],
        recommended: false
      }
    ],
    
    selectedPosition: '',
    selectedLevel: '',
    selectedType: '',
    selectedMode: 'practice' // Default to practice mode
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const statusBarHeight = sysInfo.statusBarHeight;
    const menuButton = wx.getMenuButtonBoundingClientRect();
    const navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height + statusBarHeight;

    this.setData({
      statusBarHeight,
      navHeight: navBarHeight
    });
  },

  handleBack() {
    wx.navigateBack();
  },

  selectPosition(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ selectedPosition: id });
  },

  selectLevel(e) {
    const level = e.currentTarget.dataset.level;
    this.setData({ selectedLevel: level });
  },

  selectType(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ selectedType: id });
  },

  selectMode(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ selectedMode: id });
  },

  startInterview() {
    const { selectedPosition, selectedLevel, selectedType, selectedMode } = this.data;
    
    // Validation
    if (!selectedPosition) {
      wx.showToast({ title: '请选择目标岗位', icon: 'none' });
      return;
    }
    if (!selectedLevel) {
      wx.showToast({ title: '请选择难度等级', icon: 'none' });
      return;
    }
    if (!selectedType) {
      wx.showToast({ title: '请选择面试类型', icon: 'none' });
      return;
    }
    if (!selectedMode) {
      wx.showToast({ title: '请选择面试模式', icon: 'none' });
      return;
    }
    
    // Navigate to prepare page
    wx.navigateTo({
      url: `/pages/interview/prepare/index?position=${selectedPosition}&level=${selectedLevel}&type=${selectedType}&mode=${selectedMode}`
    });
  }
});

