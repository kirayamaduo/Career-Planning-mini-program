const cloud = require('wx-server-sdk');
const OpenAI = require('openai');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 初始化 OpenAI 客户端，配置为阿里云百炼 (Qwen)
const openai = new OpenAI({
  apiKey: 'sk-d1a79240645449428802d0755537479c', 
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

exports.main = async (event, context) => {
  const { messages } = event;
  
  // 1. 构造系统提示词
  const systemPrompt = {
    role: 'system',
    content: `你是一名专业的职业规划助手 "DeepCareer"。
你的目标是帮助用户解决职业发展、求职面试、简历优化等问题。
请用专业、鼓励且条理清晰的语气回答。
如果用户问的问题与职业规划无关，请礼貌地将话题引导回职业发展领域。`
  };

  // 2. 组合消息历史
  // 确保 messages 数组格式正确，且包含 system prompt
  let fullMessages = [systemPrompt];
  if (Array.isArray(messages)) {
    fullMessages = fullMessages.concat(messages);
  }

  try {
    // 3. 调用 Qwen 模型
    const completion = await openai.chat.completions.create({
      model: 'qwen-plus', // 使用 qwen-plus 模型
      messages: fullMessages,
    });

    const reply = completion.choices[0].message.content;

    return {
      success: true,
      reply: reply
    };

  } catch (error) {
    console.error('Qwen API Error:', error);
    return {
      success: false,
      error: error.message || 'AI 服务暂时不可用'
    };
  }
};