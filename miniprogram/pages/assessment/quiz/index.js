Page({
  data: {
    questions: [],
    currentIndex: 0,
    totalQuestions: 0,
    progress: 0,
    answers: {}, // 存储用户答案 { questionId: optionValue }
    isSubmitting: false,
    isLoading: true // 新增 loading 状态
  },

  onLoad(options) {
    // 如果有传入任务ID，后续可据此拉取不同题库
    // const { taskId } = options; 
    this.fetchQuestions();
  },

  fetchQuestions() {
    wx.showLoading({ title: '加载题目中...' });
    const db = wx.cloud.database();
    
    db.collection('assessment_questions')
      .orderBy('order', 'asc') // 按 order 字段升序排列
      .get()
      .then(res => {
        wx.hideLoading();
        if (res.data && res.data.length > 0) {
          this.setData({
            questions: res.data,
            totalQuestions: res.data.length,
            currentIndex: 0,
            progress: (1 / res.data.length) * 100,
            answers: {},
            isLoading: false
          });
        } else {
          wx.showToast({ title: '暂无题目数据', icon: 'none' });
          this.setData({ isLoading: false });
        }
      })
      .catch(err => {
        wx.hideLoading();
        console.error('Failed to fetch questions', err);
        wx.showToast({ title: '题目加载失败', icon: 'none' });
        this.setData({ isLoading: false });
      });
  },
  
  // 重新开始
  retryLoad() {
    this.fetchQuestions();
  },

  onBack() {
    // 防误触提示
    wx.showModal({
      title: '退出测评',
      content: '当前进度将不会保存，确定要退出吗？',
      confirmText: '退出',
      confirmColor: '#FF4D4F',
      cancelText: '继续',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },

  // 选择选项
  selectOption(e) {
    if (this.data.isLoading || this.data.isSubmitting) return;
    
    const { value } = e.currentTarget.dataset;
    const { currentIndex, questions, answers } = this.data;
    const currentQuestion = questions[currentIndex];
    
    // 记录答案，使用数据库中的 _id 作为 key
    const newAnswers = { ...answers, [currentQuestion._id]: value };
    
    this.setData({
      answers: newAnswers
    });

    // 自动跳转下一题 (延迟 300ms)
    setTimeout(() => {
      if (currentIndex < this.data.totalQuestions - 1) {
        this.nextQuestion();
      } else {
        this.submitQuiz();
      }
    }, 300);
  },

  // 下一题
  nextQuestion() {
    const { currentIndex, totalQuestions, questions, answers } = this.data;
    const currentQuestionId = questions[currentIndex]._id;

    // 校验当前题是否已作答
    if (!answers[currentQuestionId]) {
      wx.showToast({
        title: '请先选择一个选项',
        icon: 'none'
      });
      return;
    }

    if (currentIndex < totalQuestions - 1) {
      const newIndex = currentIndex + 1;
      this.setData({
        currentIndex: newIndex,
        progress: ((newIndex + 1) / totalQuestions) * 100
      });
    }
  },

  // 上一题
  prevQuestion() {
    const { currentIndex, totalQuestions } = this.data;
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      this.setData({
        currentIndex: newIndex,
        progress: ((newIndex + 1) / totalQuestions) * 100
      });
    }
  },

  // 提交答案
  submitQuiz() {
    const { answers, totalQuestions } = this.data;
    
    // 检查是否完成所有题目
    if (Object.keys(answers).length < totalQuestions) {
      wx.showToast({
        title: '请完成所有题目',
        icon: 'none'
      });
      return;
    }

    this.setData({ isSubmitting: true });
    wx.showLoading({ title: 'AI 分析中...', mask: true });

    // 调用云函数生成报告
    wx.cloud.callFunction({
      name: 'analyzeAssessment',
      data: {
        answers: answers
      }
    }).then(res => {
      wx.hideLoading();
      
      if (res.result && res.result.success) {
        // 跳转到结果页并传递 resultId
        wx.redirectTo({
          url: `/pages/assessment/result/index?id=${res.result.resultId}`,
        });
      } else {
        this.setData({ isSubmitting: false });
        console.error('Analysis failed:', res);
        wx.showToast({
          title: '分析失败，请重试',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.hideLoading();
      this.setData({ isSubmitting: false });
      console.error('Cloud function error:', err);
      
      const errMsg = err.message || '';
      if (errMsg.includes('timed out') || err.errCode === -504003) {
         wx.showToast({
           title: '分析时间较长，请耐心等待或稍后查看结果',
           icon: 'none',
           duration: 3000
         });
      } else {
        wx.showToast({
          title: '网络异常，请重试',
          icon: 'none'
        });
      }
    });
  }
})