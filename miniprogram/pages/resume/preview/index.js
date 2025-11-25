Page({
  data: {
    resume: null,
    resumeId: '',
    navHeight: 0,
    statusBarHeight: 20,
    isPdf: false
  },

  onLoad(options) {
    // 获取导航栏高度
    const sysInfo = wx.getSystemInfoSync();
    const statusBarHeight = sysInfo.statusBarHeight;
    const menuButton = wx.getMenuButtonBoundingClientRect();
    const navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height + statusBarHeight;

    this.setData({
      statusBarHeight,
      navHeight: navBarHeight
    });

    if (options.resumeId) {
      this.setData({ resumeId: options.resumeId });
      this.loadResume(options.resumeId);
    }
  },

  // 加载简历数据
  async loadResume(resumeId) {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const db = wx.cloud.database();
      const res = await db.collection('resumes').doc(resumeId).get();
      
      if (res.data) {
        const isPdf = res.data.type === 'pdf';
        this.setData({ 
          resume: res.data,
          isPdf: isPdf
        });

        // 如果是PDF类型，打开PDF预览
        if (isPdf && res.data.pdfUrl) {
          // 获取临时下载链接
          const fileRes = await wx.cloud.getTempFileURL({
            fileList: [res.data.pdfUrl]
          });
          
          if (fileRes.fileList && fileRes.fileList[0]) {
            // 下载文件
            wx.downloadFile({
              url: fileRes.fileList[0].tempFileURL,
              success: (downloadRes) => {
                if (downloadRes.statusCode === 200) {
                  // 打开文档
                  wx.openDocument({
                    filePath: downloadRes.tempFilePath,
                    fileType: 'pdf',
                    showMenu: true,
                    success: () => {
                      console.log('打开PDF成功');
                    },
                    fail: (err) => {
                      console.error('打开PDF失败:', err);
                      wx.showToast({
                        title: '无法打开PDF',
                        icon: 'none'
                      });
                    }
                  });
                }
              },
              fail: (err) => {
                console.error('下载失败:', err);
                wx.showToast({
                  title: '下载失败',
                  icon: 'none'
                });
              }
            });
          }
        }
      }
      wx.hideLoading();
    } catch (error) {
      console.error('加载简历失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 返回
  handleBack() {
    wx.navigateBack();
  },

  // 编辑简历
  handleEdit() {
    if (this.data.resumeId) {
      wx.redirectTo({
        url: `/pages/resume/edit/index?id=${this.data.resumeId}`
      });
    }
  }
})





