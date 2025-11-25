const app = getApp();

Page({
  data: {
    resumeId: '',
    navHeight: 0,
    statusBarHeight: 20,
    isEdit: false,
    
    // 简历数据模型（按照模板设计）
    resumeData: {
      // 个人信息
      name: '',
      age: '',
      gender: '男',
      city: '',
      yearsOfWork: '',
      phone: '',
      email: '',
      
      // 求职意向
      targetPosition: '',
      targetCity: '',
      expectedSalary: '',
      availableTime: '',
      
      // 教育背景（数组）
      education: [{
        timeRange: '',
        school: '',
        major: '',
        degree: '',
        gpa: '',
        rank: '',
        courses: ''
      }],
      
      // 工作经验（数组）
      workExperience: [{
        timeRange: '',
        company: '',
        position: '',
        responsibilities: ['']
      }],
      
      // 荣誉证书（数组）
      certificates: [''],
      
      // 自我评价
      selfEvaluation: '',
      
      // 语言能力
      skills: {
        computer: '',
        english: ''
      },
      
      // 兴趣爱好
      hobbies: []
    },
    
    // 可选的性别
    genders: ['男', '女'],
    
    // 可选的学历
    degrees: ['高中', '专科', '本科', '硕士', '博士'],
    
    // 爱好标签列表
    hobbyOptions: ['爬山', '旅游', '王者荣耀', '阅读', '健身', '摄影', '音乐', '电影', '编程', '设计']
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    const statusBarHeight = sysInfo.statusBarHeight;
    const menuButton = wx.getMenuButtonBoundingClientRect();
    const navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height + statusBarHeight;

    this.setData({
      statusBarHeight,
      navHeight: navBarHeight
    });

    // 根据入口参数设置模式
    if (options.type === 'template') {
      // 新建简历（使用模板）
      this.setData({
        isEdit: false
      });
    } else if (options.id) {
      // 编辑模式：从数据库加载简历
      this.setData({
        resumeId: options.id,
        isEdit: true
      });
      this.loadResume(options.id);
    }
  },

  // 从数据库加载简历
  async loadResume(resumeId) {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const db = wx.cloud.database();
      const res = await db.collection('resumes').doc(resumeId).get();
      
      if (res.data && res.data.resumeData) {
        this.setData({
          resumeData: res.data.resumeData
        });
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

  handleBack() {
    wx.navigateBack();
  },

  // 输入字段更新
  handleFieldInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`resumeData.${field}`]: value
    });
  },

  // 选择器变化
  handlePickerChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    const options = this.data[e.currentTarget.dataset.options];
    this.setData({
      [`resumeData.${field}`]: options[value]
    });
  },

  // 添加教育经历
  addEducation() {
    const education = this.data.resumeData.education;
    education.push({
      timeRange: '',
      school: '',
      major: '',
      degree: '',
      gpa: '',
      rank: '',
      courses: ''
    });
    this.setData({
      'resumeData.education': education
    });
  },

  // 删除教育经历
  deleteEducation(e) {
    const index = e.currentTarget.dataset.index;
    const education = this.data.resumeData.education;
    education.splice(index, 1);
    this.setData({
      'resumeData.education': education
    });
  },

  // 添加工作经历
  addWork() {
    const work = this.data.resumeData.workExperience;
    work.push({
      timeRange: '',
      company: '',
      position: '',
      responsibilities: ['']
    });
    this.setData({
      'resumeData.workExperience': work
    });
  },

  // 删除工作经历
  deleteWork(e) {
    const index = e.currentTarget.dataset.index;
    const work = this.data.resumeData.workExperience;
    work.splice(index, 1);
    this.setData({
      'resumeData.workExperience': work
    });
  },

  // 添加工作职责
  addResponsibility(e) {
    const workIndex = e.currentTarget.dataset.workIndex;
    const responsibilities = this.data.resumeData.workExperience[workIndex].responsibilities;
    responsibilities.push('');
    this.setData({
      [`resumeData.workExperience[${workIndex}].responsibilities`]: responsibilities
    });
  },

  // 添加证书
  addCertificate() {
    const certificates = this.data.resumeData.certificates;
    certificates.push('');
    this.setData({
      'resumeData.certificates': certificates
    });
  },

  // 删除证书
  deleteCertificate(e) {
    const index = e.currentTarget.dataset.index;
    const certificates = this.data.resumeData.certificates;
    certificates.splice(index, 1);
    this.setData({
      'resumeData.certificates': certificates
    });
  },

  // 切换爱好标签
  toggleHobby(e) {
    const hobby = e.currentTarget.dataset.hobby;
    const hobbies = this.data.resumeData.hobbies;
    const index = hobbies.indexOf(hobby);
    
    if (index > -1) {
      hobbies.splice(index, 1);
    } else {
      hobbies.push(hobby);
    }
    
    this.setData({
      'resumeData.hobbies': hobbies
    });
  },

  // 保存简历（不进行AI诊断）
  async handleSave() {
    // 验证必填字段
    if (!this.data.resumeData.name) {
      wx.showToast({
        title: '请填写姓名',
        icon: 'none'
      });
      return;
    }

    const resumeId = await this.saveResume();
    
    if (resumeId) {
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      // 延迟返回
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    }
  },

  // 保存简历到云数据库
  async saveResume() {
    wx.showLoading({ title: '保存中...', mask: true });

    try {
      const db = wx.cloud.database();
      const resumeData = this.data.resumeData;
      
      // 生成标题
      const title = resumeData.name ? `${resumeData.name}的简历` : '我的简历';
      
      // 将结构化数据转换为文本内容（用于AI分析）
      const content = this.generateTextContent(resumeData);
      
      if (this.data.isEdit && this.data.resumeId) {
        // 更新已有简历
        await db.collection('resumes').doc(this.data.resumeId).update({
          data: {
            title: title,
            type: 'template',
            resumeData: resumeData,
            content: content,
            updateTime: db.serverDate()
          }
        });
        wx.hideLoading();
        return this.data.resumeId;
        
      } else {
        // 新建简历
        const res = await db.collection('resumes').add({
          data: {
            title: title,
            type: 'template',
            resumeData: resumeData,
            content: content,
            score: 0,
            grade: '',
            gradeText: '',
            createTime: db.serverDate(),
            updateTime: db.serverDate()
          }
        });
        
        wx.hideLoading();
        this.setData({
          resumeId: res._id,
          isEdit: true
        });
        return res._id;
      }
      
    } catch (error) {
      console.error('保存简历失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '保存失败：' + error.message,
        icon: 'none'
      });
      return null;
    }
  },

  // 将结构化数据转换为文本内容
  generateTextContent(data) {
    let content = `个人信息：${data.name || ''} ${data.age || ''}岁 ${data.gender || ''} ${data.city || ''}\n`;
    content += `工作年限：${data.yearsOfWork || ''}\n`;
    content += `联系方式：${data.phone || ''} ${data.email || ''}\n\n`;
    
    content += `求职意向：${data.targetPosition || ''}\n`;
    content += `意向城市：${data.targetCity || ''}\n`;
    content += `期望薪资：${data.expectedSalary || ''}\n`;
    content += `入职时间：${data.availableTime || ''}\n\n`;
    
    content += `教育背景：\n`;
    data.education.forEach(edu => {
      if (edu.school) {
        content += `${edu.timeRange} ${edu.school} ${edu.major} ${edu.degree}\n`;
        if (edu.gpa) content += `GPA: ${edu.gpa} ${edu.rank}\n`;
        if (edu.courses) content += `主修课程：${edu.courses}\n`;
      }
    });
    content += '\n';
    
    content += `工作经验：\n`;
    data.workExperience.forEach(work => {
      if (work.company) {
        content += `${work.timeRange} ${work.company} ${work.position}\n`;
        work.responsibilities.forEach(r => {
          if (r) content += `• ${r}\n`;
        });
      }
    });
    content += '\n';
    
    if (data.certificates.some(c => c)) {
      content += `荣誉证书：\n`;
      data.certificates.forEach(cert => {
        if (cert) content += `• ${cert}\n`;
      });
      content += '\n';
    }
    
    if (data.selfEvaluation) {
      content += `自我评价：\n${data.selfEvaluation}\n\n`;
    }
    
    content += `语言能力：\n`;
    if (data.skills.computer) content += `计算机：${data.skills.computer}\n`;
    if (data.skills.english) content += `英语：${data.skills.english}\n\n`;
    
    if (data.hobbies.length > 0) {
      content += `兴趣爱好：${data.hobbies.join('、')}\n`;
    }
    
    return content;
  }
})
