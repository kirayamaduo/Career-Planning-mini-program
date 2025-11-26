# 职业地图功能部署指南

## 📋 功能概述

职业地图模块已完成开发，提供以下功能：
- ✅ 5个职业方向的技能树可视化
- ✅ 职业切换选择器
- ✅ 动态节点渲染（已解锁/未解锁）
- ✅ 节点点击查看详情
- ✅ 炫酷的动画效果

## 🗄️ 数据库配置

### 步骤 1：创建集合

在微信云开发控制台创建集合：
- 集合名称：`career_paths`
- 权限设置：所有用户可读，仅创建者可写

### 步骤 2：导入数据

数据文件位置：`cloudfunctions/DATABASE_CAREER_PATHS.json`

**导入方式 1：手动导入（推荐）**
1. 打开云开发控制台 → 数据库 → career_paths
2. 点击"记录列表"上方的"导入"按钮
3. 选择 `DATABASE_CAREER_PATHS.json` 文件
4. 确认导入

**导入方式 2：逐条添加**
在云开发控制台中，点击"添加记录"，复制以下数据：

#### 前端开发
```json
{
  "_id": "frontend",
  "name": "前端开发",
  "icon": "</>",
  "currentLevel": "Lv.2",
  "experience": "2年",
  "branches": [
    {
      "name": "架构师",
      "emoji": "架",
      "angle": -35,
      "distance": 200,
      "unlocked": true,
      "description": "负责前端架构设计与技术选型"
    },
    {
      "name": "全栈",
      "emoji": "全",
      "angle": 145,
      "distance": 200,
      "unlocked": true,
      "description": "掌握前后端全栈开发能力"
    },
    {
      "name": "资深前端",
      "emoji": "?",
      "angle": 50,
      "distance": 150,
      "unlocked": false,
      "description": "深入掌握前端进阶技术"
    },
    {
      "name": "技术主管",
      "emoji": "?",
      "angle": 210,
      "distance": 150,
      "unlocked": false,
      "description": "带领团队进行技术攻坚"
    }
  ],
  "nextGoal": {
    "step": 1,
    "title": "掌握 Node.js 高级特性",
    "subtitle": "后端基础",
    "status": "进行中"
  }
}
```

其他4个职业的完整数据请查看 `DATABASE_CAREER_PATHS.json` 文件。

## 📁 文件修改清单

### 新增文件
- `cloudfunctions/DATABASE_CAREER_PATHS.json` - 数据库数据
- `MAP_FEATURE_README.md` - 本文档

### 修改文件
- `miniprogram/pages/map/index.js` - 添加数据加载和交互逻辑
- `miniprogram/pages/map/index.wxml` - 动态渲染和选择器
- `miniprogram/pages/map/index.wxss` - 新增组件样式

### 备份文件
原始文件已备份至：`copy/map_original_*/`

## 🧪 测试清单

在微信开发者工具中测试以下功能：

- [ ] 页面加载正常，显示默认职业（前端开发）
- [ ] 点击顶部职业选择器，能切换不同职业
- [ ] 技能树节点正确渲染（已解锁显示名称，未解锁显示"?"）
- [ ] 点击已解锁节点，弹出详情弹窗
- [ ] 点击未解锁节点，提示"该技能尚未解锁"
- [ ] 动画效果流畅（核心呼吸、节点悬浮）
- [ ] 下一阶段目标正确显示
- [ ] Tab 切换到其他页面再返回，状态正常

## ⚠️ 注意事项

1. **云环境 ID**：代码中已配置 `cloud1-3g8bn62od8f831f1`，如果你的环境不同，需要修改 `index.js` 中的 `wx.cloud.init`

2. **数据格式**：
   - `_id` 必须与职业 ID 一致（frontend/backend/product/design/operation）
   - `angle` 是节点的旋转角度（-180 到 180）
   - `distance` 是节点距离中心的距离（单位：rpx）
   - `unlocked` 控制节点是否解锁

3. **性能优化**：如果未来职业数量增加，建议：
   - 添加本地缓存机制
   - 使用分页加载
   - 优化动画性能

## 🎨 自定义修改

### 修改职业列表
编辑 `index.js` 中的 `careerOptions` 数组。

### 修改样式
- 节点样式：`.node-circle` 和 `.node-text`
- 连线样式：`.branch-line`
- 动画效果：调整 `animation` 属性

### 添加新职业
1. 在数据库 `career_paths` 中添加新记录
2. 在 `index.js` 的 `careerOptions` 中添加对应项

## 🚀 部署流程

完成测试后：
1. 提交代码：`git add . && git commit -m "feat: complete career map feature"`
2. 推送分支：`git push origin feature/map`
3. 在 GitHub 创建 PR 并合并到 main
4. 在微信开发者工具上传代码
5. 提交审核或生成体验版

---

**功能开发完成时间**：2025-11-26
**开发者**：AI Assistant
**状态**：✅ 已完成，待测试

