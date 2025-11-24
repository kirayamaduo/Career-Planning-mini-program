const questions = [
  {
    id: 1,
    title: "在团队合作中，你通常更倾向于扮演什么角色？",
    options: [
      { value: 'A', label: '领导者，负责统筹和决策' },
      { value: 'B', label: '执行者，专注于高效完成任务' },
      { value: 'C', label: '协调者，处理人际关系和沟通' },
      { value: 'D', label: '创新者，提供新点子和方案' }
    ]
  },
  {
    id: 2,
    title: "当遇到一个全新的复杂问题时，你的第一反应是？",
    options: [
      { value: 'A', label: '拆解问题，逐步分析逻辑' },
      { value: 'B', label: '寻找类似案例，参考已有经验' },
      { value: 'C', label: '与他人讨论，集思广益' },
      { value: 'D', label: '凭直觉尝试，边做边改' }
    ]
  },
  {
    id: 3,
    title: "你更喜欢哪种工作环境？",
    options: [
      { value: 'A', label: '安静独立，可以深度思考' },
      { value: 'B', label: '热闹开放，方便随时交流' },
      { value: 'C', label: '井井有条，流程规范明确' },
      { value: 'D', label: '灵活自由，充满不确定性' }
    ]
  },
  {
    id: 4,
    title: "对于重复性的日常工作，你的态度是？",
    options: [
      { value: 'A', label: '乐于接受，喜欢熟能生巧的感觉' },
      { value: 'B', label: '有些厌烦，会想办法自动化或改进' },
      { value: 'C', label: '无所谓，只要是工作一部分就行' },
      { value: 'D', label: '很难坚持，容易分心' }
    ]
  },
  {
    id: 5,
    title: "你认为自己最大的优势是？",
    options: [
      { value: 'A', label: '逻辑思维和分析能力' },
      { value: 'B', label: '沟通表达和共情能力' },
      { value: 'C', label: '审美感知和创造力' },
      { value: 'D', label: '执行力和抗压能力' }
    ]
  }
];

Page({
  data: {
    questions: [],
    currentIndex: 0,
    totalQuestions: 0,
    progress: 0,
    answers: {}, // 存储用户答案 { questionId: optionValue }
    isSubmitting: false
  },

  onLoad(options) {
    this.initQuestions();
  },

  initQuestions() {
    this.setData({
      questions: questions,
      totalQuestions: questions.length,
      currentIndex: 0,
      progress: (1 / questions.length) * 100,
      answers: {}
    });
  },

  // 选择选项
  selectOption(e) {
    const { value } = e.currentTarget.dataset;
    const { currentIndex, questions, answers } = this.data;
    const currentQuestion = questions[currentIndex];
    
    // 记录答案
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    
    this.setData({
      answers: newAnswers
    });

    // 自动跳转下一题 (可选体验优化，延迟 300ms)
    setTimeout(() => {
      if (currentIndex < this.data.totalQuestions - 1) {
        this.nextQuestion();
      }
    }, 300);
  },

  // 下一题
  nextQuestion() {
    const { currentIndex, totalQuestions } = this.data;
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

    // 模拟提交过程
    setTimeout(() => {
      this.setData({ isSubmitting: false });
      
      // 跳转到结果页 (将答案传递过去，实际开发中通常是存云数据库)
      // 这里简单起见，直接跳过去，结果页先做假数据展示
      wx.navigateTo({
        url: '/pages/assessment/result/index',
      });
    }, 1500);
  }
})