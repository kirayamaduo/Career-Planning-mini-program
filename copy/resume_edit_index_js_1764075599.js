const app = getApp();

Page({
  data: {
    content: '',
    title: '',
    resumeId: '',
    navHeight: 0,
    statusBarHeight: 20,
    placeholderText: "在此处输入或粘贴您的简历文本...\n\n例如：\n个人信息：张三 138xxxx...\n教育背景：北京大学 计算机科学...",
    pageTitle: 'AI 简历诊断',
    pageSubTitle: '粘贴简历内容，3秒生成专业分析报告',
    isEdit: false
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

    // 根据入口参数设置模式
    if (options.type === 'create') {
      this.setData({
        pageTitle: '新建简历',
        pageSubTitle: '输入您的简历内容，AI 帮您优化',
        placeholderText: '请在此输入您的简历内容...',
        isEdit: false
      });
    } else if (options.id) {
      // 编辑模式：从数据库加载简历
      this.setData({
        resumeId: options.id,
        pageTitle: '编辑简历',
        pageSubTitle: '修改内容后可再次进行 AI 诊断',
        isEdit: true
      });
      this.loadResume(options.id);
    }
  },

  // 从数据库加载简历
  async loadResume(resumeId) {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const db = wx.cloud.database();
      const res = await db.collection('resumes').doc(resumeId).get();
      
      if (res.data) {
        this.setData({
          content: res.data.content || '',
          title: res.data.title || ''
        });
      }
      wx.hideLoading();
    } catch (error) {
      console.error('加载简历失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  handleBack() {
    wx.navigateBack();
  },

  // 输入监听
  handleInput(e) {
    const val = e.detail.value;
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

  // 开始 AI 诊断
  async startAnalysis() {
    if (!this.data.content.trim()) {
      wx.showToast({
        title: '请先输入简历内容',
        icon: 'none'
      });
      return;
    }

    // 1. 先保存简历到数据库
    const resumeId = await this.saveResume();
    
    if (!resumeId) {
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
      return;
    }

    // 2. 跳转到诊断结果页，传递简历内容
    wx.navigateTo({
      url: `/pages/resume/diagnosis/index?resumeId=${resumeId}&content=${encodeURIComponent(this.data.content)}`
    });
  },

  // 保存简历到云数据库
  async saveResume() {
    wx.showLoading({ title: '保存中...', mask: true });

    try {
      const db = wx.cloud.database();
      const content = this.data.content.trim();
      
      // 自动生成标题（取前20个字符）
      let title = this.data.title || content.substring(0, 20) + '...';
      
      if (this.data.isEdit && this.data.resumeId) {
        // 更新已有简历
        await db.collection('resumes').doc(this.data.resumeId).update({
          data: {
            content: content,
            title: title,
            updateTime: db.serverDate()
          }
        });
        wx.hideLoading();
        return this.data.resumeId;
        
      } else {
        // 新建简历
        const res = await db.collection('resumes').add({
          data: {
            title: title,
            content: content,
            score: 0,
            grade: '',
            gradeText: '',
            createTime: db.serverDate(),
            updateTime: db.serverDate()
          }
        });
        
        wx.hideLoading();
        this.setData({
          resumeId: res._id,
          isEdit: true
        });
        return res._id;
      }
      
    } catch (error) {
      console.error('保存简历失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '保存失败：' + error.message,
        icon: 'none'
      });
      return null;
    }
  }
})
