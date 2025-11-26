Page({
  data: {
    position: '',
    level: '',
    type: '',
    positionName: '',
    typeName: '',
    countdown: 3
  },

  onLoad(options) {
    const { position, level, type } = options;
    
    this.setData({
      position,
      level,
      type,
      positionName: this.getPositionName(position),
      typeName: this.getTypeName(type)
    });

    // Start countdown after a short delay
    setTimeout(() => {
      this.startCountdown();
    }, 500);
  },

  startCountdown() {
    this.timer = setInterval(() => {
      const countdown = this.data.countdown;
      if (countdown > 0) {
        this.setData({ countdown: countdown - 1 });
      } else {
        clearInterval(this.timer);
        this.goToInterview();
      }
    }, 1000);
  },

  skipCountdown() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.goToInterview();
  },

  goToInterview() {
    const { position, level, type } = this.data;
    wx.redirectTo({
      url: `/pages/interview/chat/index?position=${position}&level=${level}&type=${type}`
    });
  },

  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
    }
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

  getTypeName(id) {
    const map = {
      'technical': '技术面',
      'comprehensive': '综合面',
      'hr': 'HR面'
    };
    return map[id] || id;
  }
});

