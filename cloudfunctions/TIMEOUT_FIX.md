# 云函数超时问题修复指南

## 问题描述
```
errCode: -504003 | errMsg: Invoking task timed out after 3 seconds
```

## 原因分析
- AI 调用（通义千问）响应时间通常需要 5-15 秒
- 云函数默认超时时间只有 3 秒
- 需要将超时时间调整为 60 秒

---

## ✅ 已完成的代码修改

### 1. 云函数配置文件
文件：`cloudfunctions/analyzeResume/config.json`
```json
{
  "timeout": 60  // 60 秒超时
}
```

### 2. 前端调用配置
文件：`miniprogram/pages/resume/diagnosis/index.js`
```javascript
wx.cloud.callFunction({
  name: 'analyzeResume',
  timeout: 60000, // 60000 毫秒 = 60 秒
  data: { ... }
})
```

---

## 🔧 需要您手动操作的步骤

### 步骤 1：重新部署云函数（必须）

**为什么需要重新部署？**
配置文件的修改需要重新部署才能生效。

**操作方法：**
1. 在微信开发者工具中
2. 右键点击 `cloudfunctions/analyzeResume` 文件夹
3. 选择 **"上传并部署：云端安装依赖"**
4. 等待部署完成（约 1-2 分钟）

---

### 步骤 2：验证云函数超时配置

1. 打开微信开发者工具
2. 点击顶部工具栏的 **"云开发"** 按钮
3. 进入云开发控制台
4. 左侧点击 **"云函数"**
5. 找到 `analyzeResume` 函数
6. 点击函数名称进入详情页
7. 查看 **"超时时间"** 配置
8. 确认显示为 **60 秒**

**如果显示不是 60 秒：**
- 点击 "编辑" 或 "配置"
- 手动修改超时时间为 60 秒
- 保存配置

---

## 🧪 测试步骤

### 1. 重新编译小程序
点击微信开发者工具的 "编译" 按钮

### 2. 测试简历诊断
1. 打开简历中心
2. 点击 "新建简历"
3. 输入简历内容（100-500 字）
4. 点击 "开始全维诊断"
5. 观察加载提示："AI 深度分析中..."
6. 等待 10-20 秒
7. 应该能看到诊断结果页面

### 3. 检查结果
- ✅ 显示评分（0-100）
- ✅ 显示等级（A/B/C/D）
- ✅ 显示完整分析报告
- ✅ 显示 3-5 条优化建议

---

## 🐛 如果仍然超时

### 可能的原因和解决方案

#### 原因 1：网络问题
- **解决：** 检查网络连接，切换网络重试

#### 原因 2：AI API 响应慢
- **解决：** 可以切换为更快的模型（如 qwen-turbo）
- **修改文件：** `cloudfunctions/analyzeResume/index.js`
- **第 26 行：** 将 `model: 'qwen-plus'` 改为 `model: 'qwen-turbo'`

#### 原因 3：简历内容过长
- **当前限制：** 5000 字
- **建议：** 控制在 500-2000 字以内，分析效果更好

#### 原因 4：云函数未重新部署
- **解决：** 重新执行步骤 1

---

## 📊 性能优化建议

### 1. 使用更快的 AI 模型
```javascript
// 修改 cloudfunctions/analyzeResume/index.js 第 26 行
model: 'qwen-turbo'  // 更快，但分析深度略低
// 或
model: 'qwen-plus'   // 平衡（当前使用）
// 或
model: 'qwen-max'    // 最准确，但最慢
```

### 2. 缓存分析结果
已实现：分析结果保存在数据库中，避免重复调用 AI

### 3. 添加重试机制
已实现：失败时弹窗提示，可点击"重试"按钮

---

## 📝 相关文档

- 微信云开发文档：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/capabilities.html
- 通义千问 API 文档：https://help.aliyun.com/zh/dashscope/
- 云函数超时配置：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/functions/timeout.html

---

## ❓ 常见问题

**Q: 为什么前端设置 60000，云函数设置 60？**
A: 前端单位是毫秒（ms），云函数配置单位是秒（s）。60000ms = 60s

**Q: 可以设置更长的超时时间吗？**
A: 可以，但微信云开发最大支持 60 秒。如果需要更长时间，建议：
   - 优化 AI prompt（减少返回内容）
   - 使用更快的模型
   - 将分析任务异步化

**Q: 修改配置后需要重启开发者工具吗？**
A: 不需要，只需要重新部署云函数和编译小程序即可。

---

## ✅ 检查清单

部署前请确认：
- [ ] `cloudfunctions/analyzeResume/config.json` 包含 `"timeout": 60`
- [ ] `miniprogram/pages/resume/diagnosis/index.js` 包含 `timeout: 60000`
- [ ] 重新部署了云函数
- [ ] 云开发控制台显示超时时间为 60 秒
- [ ] 重新编译了小程序
- [ ] 测试通过

完成以上步骤后，超时问题应该解决！

