Page({
  data: {
    report: null,
    isLoading: true
  },

  onLoad(options) {
    this.generateReport();
  },

  generateReport() {
    // 模拟生成报告的过程 (实际应调用云函数)
    setTimeout(() => {
      this.setData({
        isLoading: false,
        report: {
          type: "INTJ · 建筑师型",
          tags: ["富有远见", "逻辑严密", "独立自主"],
          score: 88,
          dimensions: [
            { name: "逻辑思维", value: 92 },
            { name: "创新能力", value: 85 },
            { name: "沟通协作", value: 65 },
            { name: "执行力", value: 78 },
            { name: "抗压能力", value: 80 }
          ],
          careers: [
            {
              title: "后端开发工程师",
              match: 95,
              desc: "你需要构建复杂的系统架构，这与你强大的逻辑思维完美契合。"
            },
            {
              title: "系统架构师",
              match: 90,
              desc: "宏观把控技术方案，发挥你的远见和规划能力。"
            },
            {
              title: "数据分析师",
              match: 85,
              desc: "从数据中发现规律，满足你对深度分析的渴望。"
            }
          ],
          advice: "建议重点加强团队协作能力的训练，你的个人能力很强，但学会借助团队的力量能让你走得更远。"
        }
      });
    }, 1000);
  },

  // 返回首页
  goHome() {
    wx.reLaunch({
      url: '/pages/assessment/index',
    });
  },

  // 查看岗位详情 (暂未实现)
  viewCareerDetail(e) {
    const index = e.currentTarget.dataset.index;
    wx.showToast({
      title: '查看详情: ' + this.data.report.careers[index].title,
      icon: 'none'
    });
  }
})