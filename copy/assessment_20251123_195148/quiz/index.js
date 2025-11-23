Page({
  data: {
    current: 0,
    questions: [
      {
        id: 1,
        title: "在处理复杂问题时，你更倾向于？",
        options: [
          { label: "A", text: "依靠直觉和经验快速判断" },
          { label: "B", text: "收集数据，进行逻辑推演" },
          { label: "C", text: "与他人讨论，寻求共识" },
          { label: "D", text: "寻找创新且不寻常的方案" }
        ]
      },
      {
        id: 2,
        title: "你理想的工作环境是？",
        options: [
          { label: "A", text: "安静独立，能专注思考" },
          { label: "B", text: "充满活力，经常与人互动" },
          { label: "C", text: "结构清晰，流程规范" },
          { label: "D", text: "灵活自由，充满创意挑战" }
        ]
      },
      {
        id: 3,
        title: "学习新技能时，你的习惯是？",
        options: [
          { label: "A", text: "阅读文档和理论书籍" },
          { label: "B", text: "直接上手实践，在做中学" },
          { label: "C", text: "观看视频教程或听讲座" },
          { label: "D", text: "找导师请教，模仿学习" }
        ]
      }
    ]
  },

  onBack() {
    wx.navigateBack();
  },

  selectOption(e) {
    const { index } = e.currentTarget.dataset;
    // 模拟选中效果，实际可在此保存答案
    
    setTimeout(() => {
      if (this.data.current < this.data.questions.length - 1) {
        this.setData({ current: this.data.current + 1 });
      } else {
        // 最后一题，跳转结果页
        wx.redirectTo({
          url: '/pages/assessment/result/index',
        })
      }
    }, 300);
  }
})