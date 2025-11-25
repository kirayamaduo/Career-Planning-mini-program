Page({
  data: {
    isPageActive: false,
    tasks: [],
    isLoading: true
  },
  onShow() {
    this.setData({ isPageActive: true });
    this.fetchTasks();
  },
  onHide() {
    this.setData({ isPageActive: false });
  },

  fetchTasks() {
    const db = wx.cloud.database();
    db.collection('assessment_tasks').get().then(res => {
      // UI Data Adaptor: Add icons and styles based on task type
      const adaptedTasks = res.data.map(task => {
        let icon = '📝';
        let iconClass = 'gradient-indigo-light';
        
        if (task.title.includes('兴趣')) {
          icon = '🎯';
          iconClass = 'gradient-indigo-light';
        } else if (task.title.includes('能力')) {
          icon = '📊';
          iconClass = 'gradient-green-light';
        }
        
        return {
          ...task,
          icon,
          iconClass
        };
      });

      this.setData({
        tasks: adaptedTasks,
        isLoading: false
      });
    }).catch(err => {
      console.error('Failed to fetch tasks', err);
      this.setData({ isLoading: false });
    });
  },

  handleTaskClick(e) {
    const { status, task } = e.currentTarget.dataset;
    if (status === 'active') {
      // 传递任务信息给介绍页
      this.goToQuizIntro(task);
    } else {
      wx.showToast({
        title: '暂未解锁',
        icon: 'none'
      });
    }
  },
  
  // 跳转到新的测评介绍页
  goToQuizIntro(task) {
    let url = '/pages/assessment/intro/index';
    if (task) {
       // 这里的 task 是我们数据库里的对象，包含 _id, title 等
       url += `?id=${task._id}&title=${encodeURIComponent(task.title)}`;
    }
    
    wx.navigateTo({
      url: url,
    })
  },

  goToDetail() {
    wx.navigateTo({
      url: '/pages/assessment/career-detail/index?id=frontend',
    })
  }
})
