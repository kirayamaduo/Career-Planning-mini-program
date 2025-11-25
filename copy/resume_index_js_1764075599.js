const app = getApp();

Page({
  data: {
    isPageActive: false,
    currentResume: null, // 当前选中的简历
    currentResumeId: '', // 当前选中的简历ID
    myResumes: [], // 我的简历列表
    suggestions: [] // 优化建议列表
  },

  onShow() {
    this.setData({ isPageActive: true });
    // 每次显示页面时刷新数据
    this.loadResumeData();
  },

  onHide() {
    this.setData({ isPageActive: false });
  },

  // 加载简历数据
  async loadResumeData() {
    try {
      const db = wx.cloud.database();
      
      // 获取用户的所有简历，按更新时间倒序
      const res = await db.collection('resumes')
        .orderBy('updateTime', 'desc')
        .limit(10)
        .get();
      
      if (res.data && res.data.length > 0) {
        // 如果有选中的简历ID，使用它；否则使用最新的一条
        let currentResume;
        if (this.data.currentResumeId) {
          currentResume = res.data.find(r => r._id === this.data.currentResumeId) || res.data[0];
        } else {
          currentResume = res.data[0];
        }
        
        this.setData({
          currentResume: currentResume,
          currentResumeId: currentResume._id,
          myResumes: res.data,
          suggestions: currentResume.diagnosisResult?.suggestions || []
        });
      } else {
        // 没有简历数据，显示默认状态
        this.setData({
          currentResume: null,
          myResumes: [],
          suggestions: []
        });
      }
    } catch (error) {
      console.error('加载简历数据失败:', error);
    }
  },

  // 1. AI 诊断按钮点击
  handleAiDiagnose() {
    if (!this.data.currentResume) {
      wx.showToast({
        title: '请先创建简历',
        icon: 'none'
      });
      return;
    }

    const resume = this.data.currentResume;
    
    // 判断是否已经有诊断结果
    if (resume.diagnosisResult && resume.diagnosisResult.fullReport) {
      // 已有诊断结果，直接跳转查看
      wx.navigateTo({
        url: `/pages/resume/diagnosis/index?resumeId=${resume._id}`
      });
    } else {
      // 未诊断，进行分析
      wx.navigateTo({
        url: `/pages/resume/diagnosis/index?resumeId=${resume._id}&content=${encodeURIComponent(resume.content)}`
      });
    }
  },

  // 2. 预览 PDF 点击 - 导出为图片
  handlePreviewPdf() {
    if (!this.data.currentResume) {
      wx.showToast({
        title: '请先创建简历',
        icon: 'none'
      });
      return;
    }

    // 跳转到预览页面
    wx.navigateTo({
      url: `/pages/resume/preview/index?resumeId=${this.data.currentResume._id}`
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

  // 切换当前简历
  handleSelectResume(e) {
    const id = e.currentTarget.dataset.id;
    const selectedResume = this.data.myResumes.find(r => r._id === id);
    
    if (selectedResume) {
      this.setData({
        currentResume: selectedResume,
        currentResumeId: id,
        suggestions: selectedResume.diagnosisResult?.suggestions || []
      });
      
      wx.showToast({
        title: '已切换简历',
        icon: 'success',
        duration: 1000
      });
    }
  },

  // 4. 更多操作点击 (...)
  handleResumeAction(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showActionSheet({
      itemList: ['重命名', '创建副本', '删除'],
      itemColor: '#000000',
      success: async (res) => {
        if (res.tapIndex === 0) {
          // 重命名
          wx.showModal({
            title: '重命名',
            editable: true,
            placeholderText: '请输入新名称',
            success: async (modalRes) => {
              if (modalRes.confirm && modalRes.content) {
                try {
                  const db = wx.cloud.database();
                  await db.collection('resumes').doc(id).update({
                    data: {
                      title: modalRes.content,
                      updateTime: db.serverDate()
                    }
                  });
                  wx.showToast({ title: '已重命名', icon: 'success' });
                  this.loadResumeData(); // 刷新列表
                } catch (error) {
                  wx.showToast({ title: '重命名失败', icon: 'none' });
                }
              }
            }
          });
        } else if (res.tapIndex === 1) {
          // 创建副本
          this.duplicateResume(id);
        } else if (res.tapIndex === 2) {
          // 删除
          wx.showModal({
            title: '确认删除',
            content: '删除后不可恢复，是否继续？',
            confirmColor: '#FF4D4F',
            success: async (modalRes) => {
              if (modalRes.confirm) {
                try {
                  const db = wx.cloud.database();
                  await db.collection('resumes').doc(id).remove();
                  wx.showToast({ title: '已删除', icon: 'success' });
                  this.loadResumeData(); // 刷新列表
                } catch (error) {
                  wx.showToast({ title: '删除失败', icon: 'none' });
                }
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

  // 复制简历
  async duplicateResume(id) {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('resumes').doc(id).get();
      
      if (res.data) {
        const original = res.data;
        await db.collection('resumes').add({
          data: {
            title: original.title + ' (副本)',
            content: original.content,
            score: 0,
            grade: '',
            gradeText: '',
            createTime: db.serverDate(),
            updateTime: db.serverDate()
          }
        });
        wx.showToast({ title: '副本已创建', icon: 'success' });
        this.loadResumeData(); // 刷新列表
      }
    } catch (error) {
      wx.showToast({ title: '创建失败', icon: 'none' });
    }
  },

  // 5. 优化建议点击
  handleOptimizationDetail(e) {
    const index = e.currentTarget.dataset.index;
    const suggestion = this.data.suggestions[index];
    
    if (suggestion) {
      // 使用 modal 显示详情
      wx.showModal({
        title: suggestion.title,
        content: suggestion.detail,
        showCancel: false,
        confirmText: '知道了'
      });
    }
  }
})
