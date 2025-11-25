Page({
  data: {
    report: null,
    isLoading: true
  },

  onLoad(options) {
    if (options.id) {
      this.fetchReport(options.id);
    } else {
      // 如果没有 ID，回退到模拟逻辑方便调试
      this.generateReport();
    }
  },

  fetchReport(id) {
    const db = wx.cloud.database();
    db.collection('assessment_results').doc(id).get().then(res => {
      const aiResult = res.data.result;
      
      // 数据适配：将后端返回的 AI 数据转换为前端 UI 需要的格式
      // 后端返回格式: { keywords, radar, careers, analysis }
      
      const adaptedReport = {
        type: aiResult.keywords[0] || "待定类型", // 取第一个关键词作为类型
        tags: aiResult.keywords,
        score: 88, // 暂时写死或根据 radar 计算平均分
        dimensions: [
          { name: "执行力", value: aiResult.radar[0] },
          { name: "沟通力", value: aiResult.radar[1] },
          { name: "创造力", value: aiResult.radar[2] },
          { name: "逻辑力", value: aiResult.radar[3] },
          { name: "领导力", value: aiResult.radar[4] }
          // 忽略最后一个抗压力以适配 UI 5个维度，或者修改 UI
        ],
        careers: aiResult.careers.map(c => ({
          title: c,
          match: Math.floor(Math.random() * (98 - 85) + 85), // 模拟匹配度
          desc: "AI 推荐的高匹配度岗位"
        })),
        advice: aiResult.analysis
      };

      this.setData({
        report: adaptedReport,
        isLoading: false
      });
    }).catch(err => {
      console.error('Fetch report failed', err);
      wx.showToast({
        title: '获取报告失败',
        icon: 'none'
      });
      this.setData({ isLoading: false });
    });
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