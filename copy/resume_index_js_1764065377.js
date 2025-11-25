const app = getApp();

Page({
  data: {
    isPageActive: false
  },

  onShow() {
    this.setData({ isPageActive: true });
  },

  onHide() {
    this.setData({ isPageActive: false });
  },

  // 1. AI 诊断按钮点击
  handleAiDiagnose() {
    // 跳转到 AI 助手页面，自动提问
    const app = getApp();
    if (app.globalData) {
      app.globalData.chatPrompt = '帮我深度诊断简历，给出详细的优化建议';
    }
    
    wx.switchTab({
      url: '/pages/assistant/index',
    });
  },

  // 2. 预览 PDF 点击
  handlePreviewPdf() {
    console.log('Preview PDF clicked'); // Debug log
    wx.showToast({
      title: 'PDF 生成功能开发中',
      icon: 'none',
      duration: 2000
    });
  },

  // 3. 编辑/新建简历点击
  handleEditResume(e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      // 编辑已有简历
      wx.navigateTo({
        url: `/pages/resume/edit/index?id=${id}`,
      });
    } else {
      // 新建简历
      wx.navigateTo({
        url: '/pages/resume/edit/index?type=create',
      });
    }
  },

  // 4. 更多操作点击 (...)
  handleResumeAction(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showActionSheet({
      itemList: ['重命名', '创建副本', '删除'],
      itemColor: '#000000',
      success(res) {
        if (res.tapIndex === 0) {
          // 重命名
          wx.showModal({
            title: '重命名',
            editable: true,
            placeholderText: '请输入新名称',
            success: (res) => {
              if (res.confirm && res.content) {
                wx.showToast({ title: '已重命名', icon: 'success' });
              }
            }
          });
        } else if (res.tapIndex === 1) {
          // 创建副本
          wx.showToast({ title: '副本已创建', icon: 'success' });
        } else if (res.tapIndex === 2) {
          // 删除
          wx.showModal({
            title: '确认删除',
            content: '删除后不可恢复，是否继续？',
            confirmColor: '#FF4D4F',
            success: (res) => {
              if (res.confirm) {
                wx.showToast({ title: '已删除', icon: 'success' });
              }
            }
          });
        }
      },
      fail(res) {
        console.log(res.errMsg);
      }
    });
  },

  // 5. 优化建议点击
  handleOptimizationDetail(e) {
    const prompt = e.currentTarget.dataset.prompt;
    console.log('Optimization detail clicked:', prompt); // Debug log
    
    if (prompt) {
      // 设置全局变量，然后跳转 TabBar
      const app = getApp();
      if (app.globalData) {
        app.globalData.chatPrompt = prompt;
      }
      
      wx.switchTab({
        url: '/pages/assistant/index',
      });
    }
  }
})
