// 云函数：AI 简历诊断
const cloud = require('wx-server-sdk');
const OpenAI = require('openai').default;

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 初始化 OpenAI 客户端（通义千问）
const openai = new OpenAI({
  apiKey: 'sk-d1a79240645449428802d0755537479c',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

exports.main = async (event, context) => {
  const { resumeId, content } = event;
  const wxContext = cloud.getWXContext();

  try {
    // 1. 调用 AI 分析简历
    console.log('开始分析简历，长度:', content.length);
    
    const completion = await openai.chat.completions.create({
      model: 'qwen-plus',
      messages: [
        {
          role: 'system',
          content: `你是一位专业的简历顾问。请分析用户的简历，并按照以下JSON格式返回结果：
{
  "score": 85,
  "grade": "A",
  "gradeText": "优秀",
  "fullReport": "完整的分析报告，包含优点、不足、改进方向等，使用markdown格式，字数在500-800字",
  "suggestions": [
    {
      "type": "warn",
      "icon": "⚡️",
      "title": "建议标题",
      "brief": "简短描述（20字内）",
      "detail": "详细的优化建议（100-200字）"
    }
  ]
}

要求：
1. score 是 0-100 的评分
2. grade 是 A/B/C/D 等级
3. suggestions 至少包含 3-5 条建议
4. type 可以是 "warn"(警告/橙色) 或 "info"(建议/蓝色)
5. icon 使用 emoji，如 ⚡️📊🎓💼🔍
6. 只返回 JSON，不要其他文字`
        },
        {
          role: 'user',
          content: `请分析以下简历：\n\n${content}`
        }
      ],
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;
    console.log('AI 返回:', aiResponse);

    // 2. 解析 AI 返回的 JSON
    let analysisResult;
    try {
      // 尝试提取 JSON（AI 可能返回 markdown 代码块）
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法提取 JSON');
      }
    } catch (parseError) {
      console.error('JSON 解析失败:', parseError);
      // 返回默认结构
      analysisResult = {
        score: 75,
        grade: 'B',
        gradeText: '良好',
        fullReport: aiResponse, // 使用原始文本
        suggestions: [
          {
            type: 'warn',
            icon: '⚡️',
            title: '增加量化数据',
            brief: 'HR 偏好看到具体的增长数据',
            detail: '建议在项目经历中添加具体的数据指标，如：用户增长 30%、性能优化提升 50% 等，让成果更具说服力。'
          },
          {
            type: 'info',
            icon: '🎓',
            title: '完善教育经历',
            brief: '补充主修课程可提高匹配度',
            detail: '建议补充主修课程、GPA、获奖情况等信息，特别是与应聘岗位相关的课程项目。'
          }
        ]
      };
    }

    // 3. 更新数据库中的简历记录
    const updateData = {
      score: analysisResult.score,
      grade: analysisResult.grade,
      gradeText: analysisResult.gradeText,
      lastDiagnosisTime: db.serverDate(),
      diagnosisResult: {
        fullReport: analysisResult.fullReport,
        suggestions: analysisResult.suggestions
      },
      updateTime: db.serverDate()
    };

    if (resumeId) {
      // 更新已有简历
      await db.collection('resumes').doc(resumeId).update({
        data: updateData
      });
    }

    // 4. 返回结果
    return {
      success: true,
      data: analysisResult,
      resumeId: resumeId
    };

  } catch (error) {
    console.error('简历分析失败:', error);
    return {
      success: false,
      error: error.message || '分析失败，请稍后重试'
    };
  }
};

