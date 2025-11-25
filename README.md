# AI 职业规划小程序

## 1. 项目简介

本小程序旨在利用 AI 技术，为大学生和初入职场的用户提供一站式、个性化的职业规划与求职辅导服务。我们通过科学的职业测评、智能的简历优化、逼真的模拟面试以及清晰的职业路径图，帮助用户更好地认识自我、明确方向、提升求职竞争力。

## 2. 技术栈

- **前端：** 微信小程序原生 (WXML, WXSS, JavaScript)
- **后端：** 微信云开发
  - **云函数 (Cloud Functions):** 用于处理核心业务逻辑，如与 AI 接口交互、数据分析等。
  - **云数据库 (Cloud Database):** 用于存储用户信息、测评结果、简历数据等。
  - **云存储 (Cloud Storage):** 用于存储用户上传的简历文件或其他资料。

## 3. 核心功能模块

### 开发状态跟踪

| 功能模块 | 模块标识 (ID) | 页面路径 | 负责人 | 开发状态 | 备注 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **职业测评** | `assessment` | `pages/assessment/` | - | `已对接后端` | 答题与结果生成已联调真实 AI 服务。 |
| **AI 简历优化** | `resume` | `pages/resume/` | - | `未开始` | 用户输入或上传简历，AI 进行分析并提供优化建议。 |
| **AI 模拟面试** | `interview` | `pages/interview/` | - | `未开始` | 用户选择岗位，与 AI 进行多轮对话式模拟面试。 |
| **职业技能图谱** | `map` | `pages/map/` | - | `未开始` | (原职业地图) 展示不同职业方向的技能树和学习路径。 |
| **AI 问答助手** | `assistant` | `pages/assistant/` | - | `开发中` | 已接入 Qwen 模型，支持真实多轮对话。 |

## 4. 项目结构

```
.
├── cloudfunctions/         # 云函数目录
│   ├── analyzeAssessment/  # 测评分析 (Qwen)
│   └── chatAssistant/      # AI 问答助手 (Qwen) [新增]
├── miniprogram/            # 小程序前端代码
│   ├── pages/              # 页面文件
│   │   ├── assessment/     # 职业测评
│   │   ├── assistant/      # AI 助手
│   │   ├── interview/      # 模拟面试
│   │   ├── map/            # 职业地图
│   │   └── resume/         # 简历优化
│   ├── components/         # 自定义组件
│   ├── utils/              # 工具函数
│   ├── images/             # 静态图片资源
│   ├── app.js
│   ├── app.json
│   └── app.wxss
├── project.config.json     # 项目配置文件
└── README.md               # 项目文档
```

## 5. 技术实现细节

*本章节将在开发过程中持续更新，记录各模块的关键实现逻辑、API 对接方案等。*

### 职业测评模块 (assessment)
- **首页逻辑 (`pages/assessment/index`)**:
    - 已接入云数据库 `assessment_tasks` 集合，动态获取任务列表。
    - 实现了任务状态 (`active`/`locked`) 的判断与交互控制。
    - 在 `app.js` 中配置了云环境 ID: `cloud1-3g8bn62od8f831f1`。
- **流程实现**:
    - 实现了从 介绍页 -> 答题页 -> 结果页 的完整页面跳转链路。
    - **[UI] 2025-11-24 更新**: 调整了测评首页 (`pages/assessment/index`) 样式以匹配高保真设计稿。
    - **[后端对接] 2025-11-25 更新**:
        - **答题页 (`quiz`)**: 
            - 实现了从云数据库 `assessment_questions` 动态拉取题目。
            - 优化了答题交互：选中高亮、自动跳转下一题（延迟 300ms）、进度条平滑过渡。
            - 提交时调用云函数 `analyzeAssessment` 获取 AI 分析结果，并使用 `wx.redirectTo` 避免重复提交和返回。
        - **结果页 (`result`)**: 
            - 实现了通过 `resultId` 从云数据库 `assessment_results` 获取报告数据。
            - 数据映射：将 AI 返回的 MBTI、雷达图数据、职业推荐匹配度（随机生成 85%-98%）、分析建议等映射到前端 UI。

### AI 问答助手 (assistant)
- **功能实现**:
    - 新增云函数 `chatAssistant`，复用 DashScope API Key。
    - 前端 `pages/assistant/index.js` 实现多轮对话逻辑，支持上下文携带 (最近6条)。
    - 交互优化：添加 "AI 正在思考中..." 状态反馈。

---

## 6. 代码检查与问题记录

*本章节用于记录代码审查中发现的问题、待优化的点以及 Bug 修复日志。*

### 2025-11-25 AI 助手接入
- **[新增] 云函数**: 创建了 `chatAssistant`，使用 `openai` SDK 调用通义千问 (Qwen) 模型。
- **[前端] 交互**: 替换了原有的 Mock `setTimeout` 逻辑，实现了真实的 `wx.cloud.callFunction` 调用。

### 2025-11-25 职业测评模块优化 (已归档)
- **[已修复] 题目数据硬编码**: 已改为从云数据库 (`assessment_questions`) 动态拉取。
- **[已修复] 结果生成模拟**: 已对接真实云函数 `analyzeAssessment`。
- **[优化] 提交体验**: 增加了 "AI 正在进行性格分析..." 的 Loading 提示，并增加了防止重复提交的逻辑。
