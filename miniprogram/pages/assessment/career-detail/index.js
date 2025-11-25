Page({
  data: {
    isLoading: true,
    career: null, // 初始为 null
    errorMsg: ''
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.fetchCareerDetail(id);
    } else {
      // 兼容调试：如果没有 ID，尝试加载默认的 frontend
      this.fetchCareerDetail('frontend');
    }
  },

  onBack() {
    wx.navigateBack();
  },

  fetchCareerDetail(code) {
    const db = wx.cloud.database();
    
    // 根据 code 字段查询 career_paths 集合
    db.collection('career_paths')
      .where({ code: code })
      .get()
      .then(res => {
        if (res.data && res.data.length > 0) {
          const careerData = res.data[0];
          
          this.setData({
            career: careerData,
            isLoading: false
          });
        } else {
          // -------------------
          // 降级逻辑：如果数据库里没数据，使用本地 mock 数据，防止演示“加载失败”
          // -------------------
          const mockData = this.getMockData(code);
          if (mockData) {
             this.setData({
              career: mockData,
              isLoading: false
            });
          } else {
            this.setData({
              isLoading: false,
              errorMsg: '暂无该职业的详细数据'
            });
            wx.showToast({
              title: '未找到职业数据',
              icon: 'none'
            });
          }
        }
      })
      .catch(err => {
        console.error('Failed to fetch career detail', err);
        // 降级逻辑：数据库不存在或网络错误，也回退到 Mock
        const mockData = this.getMockData(code);
          if (mockData) {
             this.setData({
              career: mockData,
              isLoading: false
            });
          } else {
            this.setData({
              isLoading: false,
              errorMsg: '加载失败，请稍后重试'
            });
          }
      });
  },

  // 本地 Mock 数据生成器
  getMockData(code) {
    if (code === 'frontend') {
      return {
        title: "前端开发工程师",
        category: "互联网 / 技术研发",
        stats: {
          avg_salary: "18k",
          talent_scarcity: "高",
          growth_rate: "15%"
        },
        tags: ["React", "Vue.js", "TypeScript", "小程序", "Node.js"],
        salary_growth: [
          { level: "初级", salary: "12k", height: "30%" },
          { level: "中级", salary: "22k", height: "50%" },
          { level: "高级", salary: "35k", height: "80%" },
          { level: "专家", salary: "50k+", height: "100%" }
        ],
        roadmap: [
          { step: "01", title: "基础夯实", desc: "HTML5, CSS3, JavaScript ES6+" },
          { step: "02", title: "框架进阶", desc: "掌握 React 或 Vue 生态体系" },
          { step: "03", title: "工程化", desc: "Webpack, Vite, CI/CD 流程" }
        ]
      };
    } else if (code === 'ui_designer') {
      return {
        title: "UI 设计师",
        category: "互联网 / 设计",
        stats: {
          avg_salary: "15k",
          talent_scarcity: "中",
          growth_rate: "10%"
        },
        tags: ["Figma", "Sketch", "色彩理论", "排版", "交互设计"],
        salary_growth: [
          { level: "初级", salary: "8k", height: "25%" },
          { level: "中级", salary: "15k", height: "45%" },
          { level: "资深", salary: "25k", height: "70%" },
          { level: "专家", salary: "40k+", height: "95%" }
        ],
        roadmap: [
          { step: "01", title: "软件基础", desc: "熟练使用 Figma, PS, AI" },
          { step: "02", title: "视觉规范", desc: "掌握设计系统与界面规范" },
          { step: "03", title: "交互思维", desc: "用户体验路径与交互动效" }
        ]
      };
    }
    return null;
  },

  // 开启学习计划 (交互反馈)
  startPlan() {
    wx.showToast({
      title: '已添加到学习计划',
      icon: 'success',
      duration: 2000
    });
  }
})