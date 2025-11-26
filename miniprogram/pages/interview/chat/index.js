Page({
  data: {
    statusBarHeight: 20,
    navHeight: 0,
    
    // Interview context
    interviewId: '',
    position: '',
    level: '',
    type: '',
    
    // Messages
    messages: [],
    questionCount: 0,
    totalQuestions: 8, // Expected total questions
    scrollToView: '',
    
    // Input
    inputText: '',
    isThinking: false,
    isRecording: false,
    
    // Camera
    cameraEnabled: false,
    
    // Avatars
    interviewerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Interviewer',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    const statusBarHeight = sysInfo.statusBarHeight;
    const menuButton = wx.getMenuButtonBoundingClientRect();
    const navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height + statusBarHeight;

    this.setData({
      statusBarHeight,
      navHeight: navBarHeight,
      position: options.position,
      level: options.level,
      type: options.type
    });

    // Initialize recorder
    this.recorderManager = wx.getRecorderManager();
    this.setupRecorderListeners();

    // Check if resuming paused interview
    if (options.resumeId) {
      this.resumeInterview(options.resumeId);
    } else {
      // Initialize new interview
      this.initInterview();
    }
  },

  async initInterview() {
    try {
      // Create interview record in database
      const db = wx.cloud.database();
      const res = await db.collection('interviews').add({
        data: {
          position: this.data.position,
          level: this.data.level,
          type: this.data.type,
          status: 'ongoing',
          messages: [],
          createTime: db.serverDate()
        }
      });
      
      this.setData({ interviewId: res._id });
      
      // Get first question
      await this.getNextQuestion();
    } catch (error) {
      console.error('Failed to initialize interview:', error);
      wx.showToast({
        title: '初始化失败',
        icon: 'none'
      });
    }
  },

  async getNextQuestion(retryCount = 0) {
    this.setData({ isThinking: true });
    
    // Add thinking indicator
    const thinkingMsg = {
      id: Date.now(),
      role: 'ai',
      content: retryCount > 0 ? `重试中 (${retryCount}/3)...` : '面试官正在思考...',
      time: this.formatTime(new Date()),
      isThinking: true
    };
    
    this.setData({
      messages: [...this.data.messages.filter(m => !m.isThinking), thinkingMsg]
    });
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'interviewAssistant',
        timeout: 60000,
        data: {
          action: 'getQuestion',
          context: {
            position: this.data.position,
            level: this.data.level,
            type: this.data.type
          },
          history: this.data.messages.filter(m => !m.isThinking).slice(-8)
        }
      });
      
      if (res.result && res.result.question) {
        // Replace thinking message with actual question
        const messages = this.data.messages.filter(m => !m.isThinking);
        const aiMessage = {
          id: Date.now(),
          role: 'ai',
          content: res.result.question,
          time: this.formatTime(new Date()),
          shouldEnd: res.result.shouldEnd || false
        };
        
        messages.push(aiMessage);
        
        this.setData({
          messages,
          isThinking: false,
          questionCount: this.data.questionCount + 1
        });
        
        // Auto scroll to bottom
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
        
        // Save to database
        await this.saveMessage(aiMessage);
        
        // Check if interview should end
        if (aiMessage.shouldEnd) {
          setTimeout(() => {
            this.confirmFinish();
          }, 2000);
        }
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Failed to get question:', error);
      
      // Retry logic
      if (retryCount < 3) {
        console.log(`Retrying... (${retryCount + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return this.getNextQuestion(retryCount + 1);
      }
      
      // Remove thinking message and show error after all retries failed
      const messages = this.data.messages.filter(m => !m.isThinking);
      const errorMsg = {
        id: Date.now(),
        role: 'ai',
        content: '抱歉，网络连接异常，请稍后重试或结束面试。',
        time: this.formatTime(new Date()),
        isError: true
      };
      messages.push(errorMsg);
      
      this.setData({
        messages,
        isThinking: false
      });
      
      wx.showToast({
        title: '网络异常',
        icon: 'none',
        duration: 2000
      });
    }
  },

  handleInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  async sendAnswer() {
    const text = this.data.inputText.trim();
    if (!text || this.data.isThinking) return;
    
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      time: this.formatTime(new Date())
    };
    
    this.setData({
      messages: [...this.data.messages, userMessage],
      inputText: ''
    });
    
    // Auto scroll to bottom after user message
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
    
    await this.saveMessage(userMessage);
    await this.getNextQuestion();
  },

  scrollToBottom() {
    // Use scroll-into-view with the last message id
    const lastMsgIndex = this.data.messages.length - 1;
    if (lastMsgIndex >= 0) {
      this.setData({
        scrollToView: `msg-${lastMsgIndex}`
      });
    }
  },

  async saveMessage(message) {
    try {
      const db = wx.cloud.database();
      await db.collection('interviews').doc(this.data.interviewId).update({
        data: {
          messages: db.command.push(message),
          updateTime: db.serverDate()
        }
      });
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  },

  confirmEnd() {
    wx.showModal({
      title: '面试操作',
      content: '是否要结束本次面试？',
      confirmText: '结束面试',
      cancelText: '暂停保存',
      success: (res) => {
        if (res.confirm) {
          this.finishInterview();
        } else {
          this.pauseInterview();
        }
      }
    });
  },

  async pauseInterview() {
    try {
      // Update interview status to paused
      const db = wx.cloud.database();
      await db.collection('interviews').doc(this.data.interviewId).update({
        data: {
          status: 'paused',
          updateTime: db.serverDate()
        }
      });
      
      wx.showToast({
        title: '已保存进度',
        icon: 'success',
        duration: 2000
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    } catch (error) {
      console.error('Failed to pause:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  },

  async resumeInterview(interviewId) {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const db = wx.cloud.database();
      const res = await db.collection('interviews').doc(interviewId).get();
      
      if (res.data) {
        const interview = res.data;
        this.setData({
          interviewId: interview._id,
          messages: interview.messages || [],
          questionCount: interview.messages ? interview.messages.filter(m => m.role === 'ai' && !m.isThinking).length : 0
        });
        
        // Update status to ongoing
        await db.collection('interviews').doc(interviewId).update({
          data: {
            status: 'ongoing',
            updateTime: db.serverDate()
          }
        });
        
        wx.hideLoading();
        
        // If last message was from user, get next question
        if (interview.messages && interview.messages.length > 0) {
          const lastMsg = interview.messages[interview.messages.length - 1];
          if (lastMsg.role === 'user') {
            await this.getNextQuestion();
          }
        }
      }
    } catch (error) {
      console.error('Failed to resume interview:', error);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  confirmFinish() {
    wx.showModal({
      title: '面试结束',
      content: '本轮面试已结束，即将生成评价报告。',
      showCancel: false,
      confirmText: '查看报告',
      success: () => {
        this.finishInterview();
      }
    });
  },

  async finishInterview(retryCount = 0) {
    wx.showLoading({ 
      title: retryCount > 0 ? `重试中 (${retryCount}/3)...` : '生成面试报告...', 
      mask: true 
    });
    
    try {
      await wx.cloud.callFunction({
        name: 'interviewAssistant',
        timeout: 60000,
        data: {
          action: 'generateReport',
          interviewId: this.data.interviewId,
          context: {
            position: this.data.position,
            level: this.data.level,
            type: this.data.type
          },
          messages: this.data.messages.filter(m => !m.isThinking && !m.isError)
        }
      });
      
      wx.hideLoading();
      wx.redirectTo({
        url: `/pages/interview/result/index?id=${this.data.interviewId}`
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
      
      // Retry logic
      if (retryCount < 3) {
        console.log(`Retrying report generation... (${retryCount + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.finishInterview(retryCount + 1);
      }
      
      wx.hideLoading();
      wx.showModal({
        title: '生成报告失败',
        content: '网络连接异常，是否重试？',
        confirmText: '重试',
        cancelText: '返回',
        success: (res) => {
          if (res.confirm) {
            this.finishInterview(0);
          } else {
            wx.navigateBack();
          }
        }
      });
    }
  },

  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // Voice recording setup
  setupRecorderListeners() {
    this.recorderManager.onStart(() => {
      console.log('Recording started');
    });

    this.recorderManager.onStop((res) => {
      console.log('Recording stopped', res);
      const { tempFilePath, duration } = res;
      
      if (duration < 1000) {
        wx.showToast({
          title: '录音时间太短',
          icon: 'none'
        });
        this.setData({ isRecording: false });
        return;
      }
      
      this.uploadAndTranscribe(tempFilePath);
    });

    this.recorderManager.onError((err) => {
      console.error('Recording error:', err);
      wx.showToast({
        title: '录音失败',
        icon: 'none'
      });
      this.setData({ isRecording: false });
    });
  },

  // Voice recording control
  startRecord() {
    if (this.data.isThinking) {
      wx.showToast({
        title: '请等待AI回复',
        icon: 'none'
      });
      return;
    }

    try {
      this.recorderManager.start({
        format: 'mp3',
        duration: 60000 // Max 60 seconds
      });
      
      this.setData({ isRecording: true });
      
      wx.showToast({
        title: '正在录音...',
        icon: 'none',
        duration: 60000
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      wx.showToast({
        title: '录音失败',
        icon: 'none'
      });
    }
  },

  stopRecord() {
    if (!this.data.isRecording) return;
    
    this.recorderManager.stop();
    this.setData({ isRecording: false });
    wx.hideToast();
  },

  // Upload and transcribe voice
  async uploadAndTranscribe(filePath) {
    wx.showLoading({ title: '语音识别中...', mask: true });
    
    try {
      // Upload to cloud storage
      const cloudPath = `interview_voice/${Date.now()}_${this.data.interviewId}.mp3`;
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath
      });
      
      console.log('Voice uploaded:', uploadRes.fileID);
      
      // Call cloud function for transcription
      const transcriptRes = await wx.cloud.callFunction({
        name: 'interviewAssistant',
        timeout: 30000,
        data: {
          action: 'transcribe',
          fileID: uploadRes.fileID
        }
      });
      
      wx.hideLoading();
      
      if (transcriptRes.result && transcriptRes.result.success && transcriptRes.result.text) {
        // Use transcribed text as answer
        this.setData({ inputText: transcriptRes.result.text });
        wx.showToast({
          title: '识别成功',
          icon: 'success'
        });
      } else {
        // Fallback: manual input
        wx.showModal({
          title: '语音识别失败',
          content: '语音转文字功能暂不可用，请手动输入回答',
          showCancel: false
        });
      }
    } catch (error) {
      console.error('Failed to transcribe:', error);
      wx.hideLoading();
      wx.showModal({
        title: '语音识别失败',
        content: '请手动输入回答',
        showCancel: false
      });
    }
  },

  toggleCamera() {
    console.log('toggleCamera called, current state:', this.data.cameraEnabled);
    const newState = !this.data.cameraEnabled;
    
    if (newState) {
      // Check current permission status first
      wx.getSetting({
        success: (res) => {
          console.log('Camera permission status:', res.authSetting['scope.camera']);
          if (res.authSetting['scope.camera'] === false) {
            // Permission denied before, guide to settings
            wx.showModal({
              title: '需要摄像头权限',
              content: '您之前拒绝了摄像头权限，需要手动开启。点击"去设置"前往小程序设置页面。',
              confirmText: '去设置',
              cancelText: '取消',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  wx.openSetting({
                    success: (settingRes) => {
                      if (settingRes.authSetting['scope.camera']) {
                        this.setData({ cameraEnabled: true });
                        wx.showToast({
                          title: '镜头已开启',
                          icon: 'success',
                          duration: 1500
                        });
                      }
                    }
                  });
                }
              }
            });
          } else if (res.authSetting['scope.camera'] === undefined) {
            // Never requested, ask for permission
            wx.authorize({
              scope: 'scope.camera',
              success: () => {
                console.log('Camera authorized successfully');
                this.setData({ cameraEnabled: true });
                wx.showToast({
                  title: '镜头已开启',
                  icon: 'success',
                  duration: 1500
                });
              },
              fail: (err) => {
                console.error('Camera authorization failed:', err);
                wx.showModal({
                  title: '无法开启摄像头',
                  content: '需要您的授权才能使用摄像头功能',
                  showCancel: false
                });
              }
            });
          } else {
            // Permission already granted
            console.log('Camera permission already granted');
            this.setData({ cameraEnabled: true });
            wx.showToast({
              title: '镜头已开启',
              icon: 'success',
              duration: 1500
            });
          }
        },
        fail: (err) => {
          console.error('Failed to get settings:', err);
          wx.showToast({
            title: '获取权限状态失败',
            icon: 'none'
          });
        }
      });
    } else {
      // Turn off camera
      console.log('Turning off camera');
      this.setData({ cameraEnabled: false });
      wx.showToast({
        title: '镜头已关闭',
        icon: 'none',
        duration: 1500
      });
    }
  },

  onCameraError(e) {
    console.error('Camera error:', e.detail);
    this.setData({ cameraEnabled: false });
    wx.showToast({
      title: '摄像头启动失败',
      icon: 'none',
      duration: 2000
    });
  },

  onUnload() {
    // Clean up
    if (this.recorderManager) {
      this.recorderManager.stop();
    }
  }
});

