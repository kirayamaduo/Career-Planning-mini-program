Page({
  data: {
    isPageActive: false,
    messages: [
      { id: 1, type: 'bot', text: '你好！我是你的职业发展助手。今天想探讨什么呢？' },
    ],
    inputValue: '',
    chips: ['初级前端要求', '中级前端要求', '更多发展方向'],
    scrollTop: 0
  },
  
  // 每次显示页面时触发动画
  onShow() {
    this.setData({ isPageActive: true });
  },
  // 离开时重置，确保下次进入时再次从透明滑入
  onHide() {
    this.setData({ isPageActive: false });
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  handleSend() {
    const text = this.data.inputValue;
    if (!text) return;
    this.addMessage(text, 'user');
    this.setData({ inputValue: '' });
    
    setTimeout(() => {
      this.addMessage(`收到！正在为您分析关于 "${text}" 的详细信息...`, 'bot');
    }, 1000);
  },

  handleChip(e) {
    const text = e.currentTarget.dataset.text;
    this.addMessage(text, 'user');
    setTimeout(() => {
      this.addMessage(`关于 ${text} 的详细介绍如下...`, 'bot');
    }, 1000);
  },

  addMessage(text, type) {
    const newMsg = { id: Date.now(), type, text };
    const messages = [...this.data.messages, newMsg];
    this.setData({ 
      messages,
      scrollTop: messages.length * 1000
    });
  }
})