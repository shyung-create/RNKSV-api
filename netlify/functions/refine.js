const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "POST only" };

    try {
        const { text, context } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [{
                    text: `사용자가 작성한 묵상 글을 다듬어 주세요. 
                    
                    지침:
                    1. **압축 조건**: 원문이 공백 포함 500자를 초과하는 경우에만 불필요한 부사와 수식어, 중복 표현을 제외하고 요약하여 500자 이내지만, 500자에 최대한 가깝게 맞추세요.
                    2. **압축 예외**: 원문이 500자 이내면 원문을 축약하지 말고 문법 교정만 하세요.
                    3. **서론 금지**: 설명이나 인사말 없이 **오직 다듬어진 본문만** 출력하세요.
                    4. **어미 유지**: 원문의 종결 어미(예: -한다, -해요)를 ** 그대로 유지**하세요.
                    5. **자연스러운 문체**: 화려한 표현으로 바꾸지 말고 바른 문법과 간결한 문체로 교정하세요.

                    교정할 묵상 내용:\n\n ${text}`
                }]
            }]
        };

        const response = await axios.post(url, payload);
        const aiText = response.data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
            body: aiText
        };
    } catch (error) {
        return { statusCode: 500, body: "Refinement failed." };
    }
};
