Page({
  data: {
    historyList: []
  },

  onLoad() {
    // Mock Data: 模拟历史记录
    const mockHistory = [
      {
        id: 'mock_1',
        type: 'mbti',
        tagName: '职业性格',
        date: '2023.11.24 14:30',
        resultTitle: 'INTJ · 建筑师型',
        desc: '富有远见的战略家，追求逻辑与效率。',
        score: 92
      },
      {
        id: 'mock_2',
        type: 'ability',
        tagName: '能力自评',
        date: '2023.11.20 09:15',
        resultTitle: '全栈潜力股',
        desc: '在逻辑思维与技术广度上表现出色。',
        score: 85
      }
    ];

    this.setData({
      historyList: mockHistory
    });
  },

  onBack() {
    wx.navigateBack();
  },

  goToResult(e) {
    const { id } = e.currentTarget.dataset;
    // 复用现有的结果页
    wx.navigateTo({
      url: `/pages/assessment/result/index?id=${id}`
    });
  },

  goTest() {
    wx.navigateBack();
  }
})
