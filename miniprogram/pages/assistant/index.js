Page({
  data: {
    isPageActive: false,
    messages: [
      { id: 1, type: 'bot', text: '你好！我是你的职业发展助手。今天想探讨什么呢？' },
    ],
    inputValue: '',
    chips: ['初级前端要求', '中级前端要求', '更多发展方向'],
    scrollTop: 0,
    isLoading: false
  },
  
  onShow() {
    this.setData({ isPageActive: true });
  },
  onHide() {
    this.setData({ isPageActive: false });
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  handleSend() {
    const text = this.data.inputValue;
    if (!text || this.data.isLoading) return;
    
    this.sendMessage(text);
    this.setData({ inputValue: '' });
  },

  handleChip(e) {
    const text = e.currentTarget.dataset.text;
    if (this.data.isLoading) return;
    this.sendMessage(text);
  },

  async sendMessage(text) {
    // 1. 添加用户消息
    this.addMessage(text, 'user');
    this.setData({ isLoading: true });

    // 2. 添加 AI 思考占位符
    const loadingId = Date.now() + 1;
    const loadingMsg = { id: loadingId, type: 'bot', text: 'AI 正在思考中...', loading: true };
    const messages = [...this.data.messages, loadingMsg];
    this.setData({ 
      messages,
      scrollTop: messages.length * 1000
    });

    try {
      // 3. 构造上下文 (取最近 6 条，避免 token 过多)
      // 过滤掉 loading 消息
      const history = this.data.messages
        .filter(m => !m.loading)
        .slice(-6)
        .map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.text
        }));

      // 4. 调用云函数
      const res = await wx.cloud.callFunction({
        name: 'chatAssistant',
        timeout: 60000, // 设置前端调用超时时间为 60s (默认是 15s)
        data: {
          messages: history
        }
      });

      // 5. 更新 UI
      const reply = res.result.success ? res.result.reply : '抱歉，我遇到了一点小问题，请稍后再试。';
      
      // 替换 loading 消息
      const newMessages = this.data.messages.map(msg => {
        if (msg.id === loadingId) {
          return { ...msg, text: reply, loading: false };
        }
        return msg;
      });

      this.setData({
        messages: newMessages,
        isLoading: false,
        scrollTop: newMessages.length * 1000
      });

    } catch (err) {
      console.error('Chat failed', err);
      
      // 错误处理
      let errMsg = '网络连接异常，请检查网络设置。';
      if (err.errMsg && err.errMsg.includes('timeout')) {
        errMsg = 'AI 思考时间较长，请稍后重试。';
      } else if (err.result && err.result.error) {
        errMsg = `AI 服务异常: ${err.result.error}`;
      }

      const newMessages = this.data.messages.map(msg => {
        if (msg.id === loadingId) {
          return { ...msg, text: errMsg, loading: false };
        }
        return msg;
      });
      
      this.setData({
        messages: newMessages,
        isLoading: false,
        scrollTop: newMessages.length * 1000
      });
    }
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