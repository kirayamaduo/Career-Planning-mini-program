const cloud = require('wx-server-sdk');
const OpenAI = require('openai');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// Initialize OpenAI client for Qwen
const openai = new OpenAI({
  apiKey: 'sk-d1a79240645449428802d0755537479c',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

exports.main = async (event, context) => {
  const { action } = event;
  
  try {
    switch (action) {
      case 'getQuestion':
        return await getNextQuestion(event);
      case 'generateReport':
        return await generateReport(event);
      case 'transcribe':
        return await transcribeVoice(event);
      default:
        return { error: 'Unknown action' };
    }
  } catch (error) {
    console.error('Interview assistant error:', error);
    return {
      error: error.message || 'Service error'
    };
  }
};

// Get next interview question
async function getNextQuestion(data) {
  const { context, history } = data;
  
  const positionMap = {
    'frontend': '前端开发',
    'backend': '后端开发',
    'product': '产品经理',
    'design': 'UI设计',
    'operation': '运营',
    'other': '其他'
  };
  
  const typeMap = {
    'technical': '技术面',
    'comprehensive': '综合面',
    'hr': 'HR面'
  };
  
  const positionName = positionMap[context.position] || context.position;
  const typeName = typeMap[context.type] || context.type;
  
  const systemPrompt = `你是一位经验丰富的${positionName}面试官，正在进行${context.level}难度的${typeName}。你需要严格且专业地评估候选人。

重要原则：
1. 真实评价：如果候选人回答得不好、答非所问、或者明显是胡编的，要明确指出问题
2. 有深度的追问：不要只是走过场，要根据回答追问细节，检验真实性
3. 保持专业标准：${context.level}难度的面试应该有相应的要求，不能随便通过

面试流程：
- 第1题：简单的自我介绍或破冰
- 第2-3题：基础专业问题，考察理论知识
- 第4-6题：深入的实战问题，要求具体案例和数据
- 第7-8题：难度较高的综合题或情景题
- 如果候选人多次回答不好，可以提前结束

反馈要求：
- 回答好：给予认可，如"不错，这个方案考虑得比较全面"
- 回答一般：委婉指出，如"嗯...这个方向可以，但是能更具体一点吗？比如..."
- 回答差：明确指出，如"这个理解有偏差，实际上..."或"能举个具体的例子吗？你刚才的回答比较笼统"
- 答非所问：引导回正题，如"我问的是...，你能针对这个问题展开吗？"

提问示例：
✅ 第一轮："你好，先简单介绍一下自己和为什么应聘这个岗位吧。"
✅ 回答好："不错，看得出你对${positionName}很有热情。那你在项目中有没有遇到过[具体技术问题]？"
✅ 回答差："嗯...你能更具体地说说吗？比如用了什么具体技术？有什么量化的数据？"

返回格式（必须是纯JSON，不要任何其他文字）：
{
  "question": "你的反馈和问题",
  "shouldEnd": false
}`;

  const messages = [
    { role: 'system', content: systemPrompt }
  ];
  
  // Add history
  if (Array.isArray(history) && history.length > 0) {
    messages.push(...history.map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content
    })));
  }
  
  // Request next question
  messages.push({ 
    role: 'user', 
    content: history.length === 0 ? '请开始第一个面试问题' : '请根据我的回答，提出下一个问题' 
  });
  
  const response = await openai.chat.completions.create({
    model: 'qwen-turbo',
    messages: messages,
    temperature: 0.8
  });
  
  const content = response.choices[0].message.content;
  
  // Try to parse JSON response with better error handling
  let result = null;
  try {
    // Try to extract JSON from markdown code blocks or plain text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.log('Failed to parse JSON:', e.message);
    result = null;
  }
  
  // Validate result structure
  if (result && typeof result === 'object' && result.question) {
    return {
      question: String(result.question).trim(),
      shouldEnd: Boolean(result.shouldEnd)
    };
  }
  
  // Fallback: treat entire response as question text
  // Remove markdown code blocks if present
  const cleanContent = content
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
  
  const questionCount = history.filter(m => m.role === 'ai').length;
  
  return {
    question: cleanContent,
    shouldEnd: questionCount >= 8 // Safety: max 8 questions
  };
}

// Generate interview report
async function generateReport(data) {
  const { interviewId, context, messages } = data;
  
  const positionMap = {
    'frontend': '前端开发',
    'backend': '后端开发',
    'product': '产品经理',
    'design': 'UI设计',
    'operation': '运营',
    'other': '其他'
  };
  
  const typeMap = {
    'technical': '技术面',
    'comprehensive': '综合面',
    'hr': 'HR面'
  };
  
  const positionName = positionMap[context.position] || context.position;
  const typeName = typeMap[context.type] || context.type;
  
  const systemPrompt = `你是${positionName}领域的资深面试评估专家。请严格、客观地评估这次面试表现。

评分标准（请严格执行）：
1. 专业能力（35%）- 专业知识的准确性、深度、实战经验
2. 沟通表达（20%）- 表达清晰度、逻辑性、重点把握
3. 逻辑思维（20%）- 分析问题的条理性、系统性
4. 应变能力（15%）- 面对追问的反应、问题解决思路
5. 综合素质（10%）- 学习能力、团队协作意识等

打分规则：
- 如果回答空洞、答非所问、明显胡编 → 该维度20-40分
- 如果回答一般、缺乏深度但基本正确 → 该维度50-70分
- 如果回答准确、有深度、有实例 → 该维度70-85分
- 如果回答优秀、有独特见解、超出预期 → 该维度85-95分

总分计算：各维度加权平均
等级划分：
- 90-100: A (优秀)
- 80-89: B (良好) 
- 70-79: C (中等)
- 60-69: D (及格)
- 0-59: E (不及格)

返回格式（必须是纯JSON，不要markdown标记）：
{
  "score": 75,
  "grade": "B",
  "gradeText": "良好",
  "dimensions": [
    { "name": "专业能力", "score": 75 },
    { "name": "沟通表达", "score": 78 },
    { "name": "逻辑思维", "score": 72 },
    { "name": "应变能力", "score": 76 },
    { "name": "综合素质", "score": 74 }
  ],
  "feedback": "详细的综合评价（200-300字），要指出具体的优点和不足，基于实际回答内容",
  "suggestions": [
    "具体的改进建议1（针对实际问题）",
    "具体的改进建议2",
    "具体的改进建议3"
  ]
}

重要：只返回上述JSON格式，不要有任何其他文字或代码块标记。`;

  // Format dialog
  const dialogText = messages
    .filter(m => !m.isThinking)
    .map(m => `${m.role === 'ai' ? '面试官' : '候选人'}: ${m.content}`)
    .join('\n\n');
  
  const response = await openai.chat.completions.create({
    model: 'qwen-plus',
    messages: [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `面试场景：${positionName} ${context.level} ${typeName}\n\n对话记录：\n${dialogText}\n\n请给出评价。` 
      }
    ],
    temperature: 0.7
  });
  
  let result;
  const rawContent = response.choices[0].message.content;
  
  try {
    // Try to extract and parse JSON
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!result.score || !result.grade || !result.dimensions) {
        throw new Error('Missing required fields');
      }
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (e) {
    console.error('Failed to parse report JSON:', e.message);
    console.log('Raw response:', rawContent);
    
    // Fallback result with raw content as feedback
    result = {
      score: 75,
      grade: 'B',
      gradeText: '良好',
      dimensions: [
        { name: '专业能力', score: 75 },
        { name: '沟通表达', score: 78 },
        { name: '逻辑思维', score: 72 },
        { name: '应变能力', score: 76 },
        { name: '综合素质', score: 74 }
      ],
      feedback: rawContent.replace(/```json|```/g, '').trim(),
      suggestions: ['继续加强专业技能学习', '提升沟通表达能力', '多进行模拟练习']
    };
  }
  
  // Save to database
  await db.collection('interview_results').add({
    data: {
      interviewId: interviewId,
      ...result,
      createTime: db.serverDate()
    }
  });
  
  // Update interview status
  await db.collection('interviews').doc(interviewId).update({
    data: {
      status: 'completed',
      updateTime: db.serverDate()
    }
  });
  
  return { success: true };
}

// Voice transcription (placeholder)
async function transcribeVoice(data) {
  // TODO: Implement voice transcription
  return {
    text: '[语音转文字功能待实现]',
    success: false
  };
}

