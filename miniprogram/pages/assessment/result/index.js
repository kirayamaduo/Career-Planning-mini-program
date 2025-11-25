Page({
  data: {
    report: null,
    isLoading: true,
    showShare: false // 控制分享弹窗
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
      console.log('[DEBUG] AI Result Data:', aiResult); // 打印完整数据
      
      // 数据适配：将后端返回的 AI 数据转换为前端 UI 需要的格式
      // 后端返回格式: { mbti, type_name, keywords, radar, careers, analysis }
      
      // 兼容旧数据：如果 AI 返回里没有 mbti 字段，降级使用 keywords[0]
      const displayType = aiResult.mbti 
        ? `${aiResult.mbti} · ${aiResult.type_name}`
        : (aiResult.keywords[0] || "待定类型");

      const adaptedReport = {
        type: displayType,
        tags: aiResult.keywords,
        score: 88, // 暂时写死
        dimensions: [
          // 对应云函数 prompt 定义的 6 个维度
          { name: "外向 E", value: aiResult.radar[0] },
          { name: "直觉 N", value: aiResult.radar[1] },
          { name: "思考 T", value: aiResult.radar[2] },
          { name: "判断 J", value: aiResult.radar[3] },
          { name: "领导力", value: aiResult.radar[4] }
          // UI 默认只显示 5 个，取前 5 个核心维度
        ],
        careers: aiResult.careers.map(c => ({
          title: c,
          match: Math.floor(Math.random() * (98 - 85) + 85),
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

  // 分享相关逻辑
  showShareModal() {
    this.setData({ showShare: true });
  },

  hideShareModal() {
    this.setData({ showShare: false });
  },
  
  stopProp() {},

  saveImageMock() {
    wx.showLoading({ title: '保存中...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '已保存到相册',
        icon: 'success'
      });
      this.hideShareModal();
    }, 1000);
  },

  // 返回首页
  goHome() {
    wx.reLaunch({
      url: '/pages/assessment/index',
    });
  },

  // 查看岗位详情
  viewCareerDetail(e) {
    const index = e.currentTarget.dataset.index;
    const career = this.data.report.careers[index];
    
    // 简单的映射逻辑：如果标题包含"前端"，跳转到 frontend
    // 真实场景下，AI 应该返回 career_code
    let code = '';
    if (career.title.includes('前端')) {
      code = 'frontend';
    } else {
      // 默认跳转，或提示暂无详情
      // 这里为了演示体验，如果不是前端，暂时也都跳到 frontend (或者您可以再录入一条后端数据)
      code = 'frontend'; 
    }

    wx.navigateTo({
      url: `/pages/assessment/career-detail/index?id=${code}`,
    });
  }
})