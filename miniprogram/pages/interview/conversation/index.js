// pages/interview/conversation/index.js
Page({
  data: {
    interviewId: '',
    messages: [],
    interviewInfo: {}
  },

  async onLoad(options) {
    if (options.id) {
      this.setData({ interviewId: options.id });
      await this.loadConversation();
    }
  },

  async loadConversation() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const db = wx.cloud.database();
      const res = await db.collection('interviews').doc(this.data.interviewId).get();
      
      if (res.data) {
        const messages = res.data.messages.filter(m => !m.isThinking && !m.isError);
        
        this.setData({
          messages: messages,
          interviewInfo: {
            position: res.data.position,
            level: res.data.level,
            type: res.data.type,
            createTime: res.data.createTime
          }
        });
      }
      
      wx.hideLoading();
    } catch (error) {
      console.error('Failed to load conversation:', error);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${month}月${day}日`;
  },

  copyContent(e) {
    const content = e.currentTarget.dataset.content;
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        });
      }
    });
  }
})

