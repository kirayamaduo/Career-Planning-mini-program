Page({
  data: {
    isPageActive: false,
    currentCareer: null,
    careerOptions: [
      { id: 'frontend', name: '前端开发' },
      { id: 'backend', name: '后端开发' },
      { id: 'product', name: '产品经理' },
      { id: 'design', name: 'UI设计' },
      { id: 'operation', name: '运营' }
    ],
    selectedIndex: 0,
    loading: true,
    showNodeDetail: false,
    selectedNode: null
  },

  onLoad() {
    // 初始化云能力
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-3g8bn62od8f831f1',
        traceUser: true
      });
    }
    
    // 加载默认职业数据（前端开发）
    this.loadCareerData('frontend');
  },

  onShow() {
    this.setData({ isPageActive: true });
  },

  onHide() {
    this.setData({ isPageActive: false });
  },

  // 加载职业数据
  async loadCareerData(careerId) {
    this.setData({ loading: true });
    
    try {
      const db = wx.cloud.database();
      const res = await db.collection('career_paths').doc(careerId).get();
      
      if (res.data) {
        this.setData({
          currentCareer: res.data,
          loading: false
        });
      } else {
        wx.showToast({
          title: '暂无该职业数据',
          icon: 'none'
        });
        this.setData({ loading: false });
      }
    } catch (error) {
      console.error('加载职业数据失败:', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 职业选择器改变
  onCareerChange(e) {
    const index = e.detail.value;
    const careerId = this.data.careerOptions[index].id;
    
    this.setData({ selectedIndex: index });
    this.loadCareerData(careerId);
  },

  // 点击节点查看详情
  onNodeTap(e) {
    const node = e.currentTarget.dataset.node;
    
    if (node.unlocked) {
      this.setData({
        showNodeDetail: true,
        selectedNode: node
      });
    } else {
      wx.showToast({
        title: '该技能尚未解锁',
        icon: 'none'
      });
    }
  },

  // 关闭节点详情弹窗
  closeNodeDetail() {
    this.setData({
      showNodeDetail: false,
      selectedNode: null
    });
  },

  // 编辑职业信息（预留功能）
  editCareer() {
    wx.showToast({
      title: '编辑功能开发中',
      icon: 'none'
    });
  }
})