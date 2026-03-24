const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "POST only" };

    try {
        const { text, context } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        // 성경 구절이 있는 경우에만 프롬프트에 추가
        const bibleContext = context && context.trim() !== "" 
            ? `참고할 성경 구절:\n${context}\n\n` 
            : "";

        const payload = {
            contents: [{
                parts: [{
                    text: `${bibleContext}사용자가 작성한 묵상 글을 다듬어 주세요. 
                    
                    지침:
                    1. **분량 유지**: 원문이 공백 포함 500자 이내라면 내용을 절대 요약하지 마세요.
                    2. **압축 조건**: 원문이 500자를 초과하는 경우에만 핵심 위주로 요약하여 500자 이내로 맞추세요.
                    3. **맥락 참고**: 제공된 '성경 구절'이 있다면, 사용자의 묵상이 구절의 의미와 잘 연결되도록 단어 선택을 정교하게 다듬어 주세요.
                    4. **서론 금지**: 설명이나 인사말 없이 **오직 다듬어진 본문만** 출력하세요.
                    5. **어미 유지**: 원문의 종결 어미(예: -한다, -해요)를 **반드시 그대로 유지**하세요.
                    6. **자연스러운 문체**: 화려한 표현으로 바꾸지 말고 바른 문법과 담백한 문체로 교정하세요.

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
