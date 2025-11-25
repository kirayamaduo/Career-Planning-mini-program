Page({
  data: {
    report: null,
    isLoading: true,
    showShare: false, // 控制分享弹窗
    navHeight: 0, // 导航栏高度
    menuButtonTop: 0 // 胶囊按钮顶部距离
  },

  onLoad(options) {
    this.calcNavBar();
    if (options.id) {
      this.fetchReport(options.id);
    } else {
      // 如果没有 ID，回退到模拟逻辑方便调试
      // this.generateReport(); 
      // 实际上生产环境应该提示错误或返回
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      this.setData({ isLoading: false });
    }
  },

  calcNavBar() {
    const systemInfo = wx.getSystemInfoSync();
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    
    // 导航栏总高度 = 胶囊底部 + 胶囊到底部的间距 (通常取胶囊上边距)
    // 或者简单起见: 胶囊底部 + 8px padding
    const navHeight = menuButtonInfo.bottom + 8;
    
    this.setData({
      navHeight: navHeight,
      menuButtonTop: menuButtonInfo.top
    });
  },

  fetchReport(id) {
    const db = wx.cloud.database();
    db.collection('assessment_results').doc(id).get().then(res => {
      const aiResult = res.data.result;
      console.log('[DEBUG] AI Result Data:', aiResult); 
      
      if (!aiResult) {
        throw new Error('Result data is empty');
      }

      // 数据适配
      const displayType = aiResult.mbti 
        ? `${aiResult.mbti} · ${aiResult.type_name}`
        : (aiResult.type_name || "待定类型");

      // 映射雷达图维度
      const radarLabels = ["外向 E", "直觉 N", "思考 T", "判断 J", "领导力", "抗压力"];
      const dimensions = radarLabels.map((label, index) => ({
        name: label,
        value: (aiResult.radar && aiResult.radar[index]) || 0
      }));

      // 映射职业推荐
      const careers = (aiResult.careers || []).map(c => ({
        title: c,
        // 随机生成 85-98 之间的匹配度
        match: Math.floor(Math.random() * (98 - 85 + 1) + 85), 
        desc: "AI 推荐的高匹配度岗位"
      }));

      const adaptedReport = {
        type: displayType,
        tags: aiResult.keywords || [],
        score: 88, // 暂时写死，或者可以基于某种逻辑计算
        dimensions: dimensions,
        careers: careers,
        advice: aiResult.analysis || "暂无分析建议"
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