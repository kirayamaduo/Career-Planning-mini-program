Page({
  data: {

  },

  // 上传简历 (支持从聊天记录选择文件)
  handleUpload() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      success: (res) => {
        const file = res.tempFiles[0];
        console.log('选择的文件', file);
        
        // TODO: 上传文件到云存储，然后跳转到分析页
        wx.showLoading({ title: '解析中...' });
        setTimeout(() => {
          wx.hideLoading();
          // 暂时只打印，后续对接
          wx.showToast({ title: '文件已选择', icon: 'success' });
        }, 1000);
      },
      fail: (err) => {
        // 用户取消不算错误
        if (err.errMsg.indexOf('cancel') === -1) {
          console.error(err);
          wx.showToast({ title: '选择失败', icon: 'none' });
        }
      }
    })
  },

  // 粘贴文本
  handlePaste() {
    // 跳转到文本输入页 (暂未开发，先用 Toast 示意)
    wx.showModal({
      title: '即将开发',
      content: '文本输入编辑页面正在开发中...',
      showCancel: false
    });
  }
})