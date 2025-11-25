const cloud = require('wx-server-sdk');
const OpenAI = require('openai');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 初始化 OpenAI 客户端
// 注意：正式环境请务必在云控制台配置 DASHSCOPE_API_KEY 环境变量，不要硬编码
const API_KEY = process.env.DASHSCOPE_API_KEY || 'sk-d1a79240645449428802d0755537479c';

const openai = new OpenAI({
  apiKey: API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

exports.main = async (event, context) => {
  const { answers } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    // 1. 构建 Prompt
    // 将用户的答案对象 { "q1": "A", "q2": "B" } 转换为可读文本
    const answerText = Object.entries(answers).map(([key, value]) => {
      return `题目${key}: 选项${value}`;
    }).join('; ');

    const systemPrompt = `你是一位 MBTI 职业性格分析专家。请根据用户的测评答案，精准判断其 MBTI 类型，并返回严格的 JSON 格式报告。
(Version: v3-debug-mbti)

JSON 示例：
{
  "mbti": "INTJ",
  "type_name": "建筑师型",
  "keywords": ["富有远见", "逻辑严密", "独立自主"],
  "radar": [80, 70, 60, 85, 75, 65],
  "careers": ["系统架构师", "后端开发"],
  "analysis": "..."
}

要求：
1. 必须包含 mbti (4字母) 和 type_name (中文) 字段。
2. radar 对应维度：外向E, 直觉N, 思考T, 判断J, 领导力, 抗压力。
3. 仅返回 JSON 字符串。`;

    // 2. 调用 Qwen-Omni
    const completion = await openai.chat.completions.create({
      model: "qwen3-omni-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `用户的测评答案是：${answerText}。请生成职业分析报告。` }
      ],
      stream: true, // 强制流式
      stream_options: { include_usage: true },
      modalities: ["text"] // 仅文本模式
    });

    // 3. 处理流式响应，拼接文本
    let fullContent = "";
    for await (const chunk of completion) {
      if (chunk.choices && chunk.choices.length > 0) {
        const delta = chunk.choices[0].delta;
        if (delta.content) {
          fullContent += delta.content;
        }
      }
    }

    console.log('AI Response:', fullContent);

    // 4. 解析 JSON
    let resultData;
    try {
      // 尝试清理可能的 markdown 标记
      const cleanJson = fullContent.replace(/```json/g, '').replace(/```/g, '').trim();
      resultData = JSON.parse(cleanJson);
    } catch (e) {
      console.error('JSON Parse Error:', e);
      // 兜底数据，防止解析失败导致前端崩溃
      resultData = {
        keywords: ["解析失败", "请重试"],
        radar: [50, 50, 50, 50, 50, 50],
        careers: ["暂无推荐"],
        analysis: "AI 返回数据格式异常，原始返回：" + fullContent
      };
    }

    // 5. 存入数据库
    const dbResult = await db.collection('assessment_results').add({
      data: {
        _openid: openid,
        createTime: db.serverDate(),
        answers: answers,
        result: {
          ...resultData,
          _debug_version: "v3-debug-mbti" // 强制打上版本标签
        }
      }
    });

    return {
      success: true,
      resultId: dbResult._id,
      data: resultData
    };

  } catch (err) {
    console.error('Cloud Function Error:', err);
    return {
      success: false,
      error: err.message
    };
  }
};
