const app = getApp();

Page({
  data: {
    content: '',
    navHeight: 0,
    statusBarHeight: 20,
    placeholderText: "在此处输入或粘贴您的简历文本...\n\n例如：\n个人信息：张三 138xxxx...\n教育背景：北京大学 计算机科学..."
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

  // 输入监听
  handleInput(e) {
    const val = e.detail.value;
    console.log('Input Value:', val, 'Length:', val.length); // Debug
    this.setData({
      content: val
    });
  },

  // 粘贴剪贴板
  handlePasteClipboard() {
    wx.getClipboardData({
      success: (res) => {
        const newContent = this.data.content + res.data;
        if (newContent.length > 5000) {
          wx.showToast({
            title: '内容过长，已截断',
            icon: 'none'
          });
        }
        this.setData({
          content: newContent.substring(0, 5000)
        });
        wx.showToast({
          title: '已粘贴',
          icon: 'success'
        });
      }
    });
  },

  startAnalysis() {
    if (!this.data.content.trim()) return;

    wx.showLoading({
      title: 'AI 深度诊断中...',
      mask: true
    });

    setTimeout(() => {
      wx.hideLoading();
      wx.navigateTo({
        url: '/pages/resume/result/index', 
        success: (res) => {},
        fail: () => {
          wx.showToast({
            title: '分析完成 (模拟)',
            icon: 'success'
          });
        }
      });
    }, 1500);
  }
})