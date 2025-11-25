const app = getApp();

Page({
  data: {
    content: '',
    navHeight: 0,
    statusBarHeight: 20,
    placeholderText: "在此处输入或粘贴您的简历文本...\n\n例如：\n个人信息：张三 138xxxx...\n教育背景：北京大学 计算机科学...",
    pageTitle: 'AI 简历诊断',
    pageSubTitle: '粘贴简历内容，3秒生成专业分析报告'
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    const statusBarHeight = sysInfo.statusBarHeight;
    const menuButton = wx.getMenuButtonBoundingClientRect();
    const navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height + statusBarHeight;

    this.setData({
      statusBarHeight,
      navHeight: navBarHeight
    });

    // 根据入口参数设置标题
    if (options.type === 'create') {
      this.setData({
        pageTitle: '新建简历',
        pageSubTitle: '输入您的简历内容，AI 帮您优化',
        placeholderText: '请在此输入您的简历内容...'
      });
    } else if (options.id) {
      // 模拟获取简历详情
      this.setData({
        pageTitle: '编辑简历',
        pageSubTitle: '修改内容后可再次进行 AI 诊断',
        content: '模拟的简历内容：\n高级前端工程师\n...' // 这里可以后续接真实数据
      });
    }
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
