Page({
  data: {
    loading: true,
    analysisResult: null,
    resumeId: '',
    score: 0,
    grade: 'B',
    gradeText: '良好',
    fullReport: '',
    suggestions: [],
    progress: 0,  // 进度百分比
    progressText: '正在初始化...'  // 进度文本
  },

  onLoad(options) {
    const { resumeId, content } = options;
    
    if (resumeId) {
      this.setData({ resumeId });
    }

    // 如果传入了 content，说明是从编辑页直接诊断
    if (content) {
      this.analyzeResume(resumeId, decodeURIComponent(content));
    } else if (resumeId) {
      // 如果只有 resumeId，从数据库读取已有的诊断结果
      this.loadDiagnosisResult(resumeId);
    }
  },

  // 调用云函数分析简历
  async analyzeResume(resumeId, content) {
    // 开始模拟进度条
    this.startProgressSimulation();

    try {
      const res = await wx.cloud.callFunction({
        name: 'analyzeResume',
        timeout: 60000, // 设置超时时间为 60 秒（60000毫秒）
        data: {
          resumeId: resumeId,
          content: content
        }
      });
      
      console.log('云函数返回结果:', res);

      // 停止进度模拟，设置为100%
      this.stopProgressSimulation();
      this.setData({ progress: 100, progressText: '分析完成！' });

      if (res.result.success) {
        const data = res.result.data;
        this.setData({
          loading: false,
          analysisResult: data,
          score: data.score,
          grade: data.grade,
          gradeText: data.gradeText,
          fullReport: data.fullReport,
          suggestions: data.suggestions || []
        });
      } else {
        this.setData({ loading: false });
        wx.showToast({
          title: res.result.error || '分析失败',
          icon: 'none',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('调用云函数失败:', error);
      this.stopProgressSimulation();
      this.setData({ loading: false });
      
      // 更详细的错误提示
      let errorMsg = 'AI 分析异常，请重试';
      if (error.errMsg) {
        if (error.errMsg.includes('timeout') || error.errMsg.includes('TIME_LIMIT_EXCEEDED')) {
          errorMsg = 'AI 思考时间较长，请稍后重试';
        } else if (error.errMsg.includes('network')) {
          errorMsg = '网络连接失败，请检查网络';
        }
      }
      
      wx.showModal({
        title: '分析失败',
        content: errorMsg + '\n\n错误详情：' + (error.errMsg || error.message || '未知错误'),
        showCancel: true,
        confirmText: '重试',
        cancelText: '返回',
        success: (res) => {
          if (res.confirm) {
            // 重试
            this.analyzeResume(resumeId, content);
          } else {
            // 返回
            wx.navigateBack();
          }
        }
      });
    }
  },

  // 从数据库加载已有的诊断结果
  async loadDiagnosisResult(resumeId) {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('resumes').doc(resumeId).get();
      
      if (res.data && res.data.diagnosisResult) {
        const result = res.data.diagnosisResult;
        this.setData({
          loading: false,
          score: res.data.score || 0,
          grade: res.data.grade || 'B',
          gradeText: res.data.gradeText || '良好',
          fullReport: result.fullReport || '',
          suggestions: result.suggestions || []
        });
      } else {
        wx.showToast({
          title: '暂无诊断记录',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('加载失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 查看建议详情
  handleSuggestionDetail(e) {
    const index = e.currentTarget.dataset.index;
    const suggestion = this.data.suggestions[index];
    
    // 使用 modal 显示详情（简单方案）
    wx.showModal({
      title: suggestion.title,
      content: suggestion.detail,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 返回简历中心
  handleBackToResume() {
    wx.navigateBack();
  },

  // 开始进度模拟
  startProgressSimulation() {
    this.setData({ 
      progress: 0,
      progressText: '正在连接 AI 服务...'
    });

    let progress = 0;
    const stages = [
      { percent: 20, text: '正在分析简历结构...' },
      { percent: 40, text: '识别关键信息中...' },
      { percent: 60, text: 'AI 深度评估中...' },
      { percent: 80, text: '生成优化建议...' },
      { percent: 95, text: '即将完成...' }
    ];

    let stageIndex = 0;

    this.progressTimer = setInterval(() => {
      progress += Math.random() * 5; // 随机增长

      if (progress >= stages[stageIndex].percent && stageIndex < stages.length - 1) {
        stageIndex++;
      }

      // 不超过95%，等待真实结果
      if (progress > 95) {
        progress = 95;
      }

      this.setData({
        progress: Math.floor(progress),
        progressText: stages[stageIndex].text
      });

      // 达到95%后停止自动增长
      if (progress >= 95) {
        clearInterval(this.progressTimer);
      }
    }, 300);
  },

  // 停止进度模拟
  stopProgressSimulation() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  },

  onUnload() {
    // 页面卸载时清理定时器
    this.stopProgressSimulation();
  }
})

