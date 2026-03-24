const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "POST only" };

    try {
        const { text } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [{
                    text: `다음은 사용자가 작성한 개인적인 묵상 글입니다. 
                    본래의 의도와 감정을 최대한 유지하면서, 맞춤법과 문법을 교정하고 문장을 매끄럽게 다듬어 주세요. 

                    지침:
                    1. **분량 유지**: 원문이 공백 포함 500자 이내라면 내용을 요약하지 마세요. 모든 문장을 유지하며 문법 교정만 하세요.
                    2. **압축 조건**: 원문이 500자를 초과하는 경우에만 핵심 위주로 압축하거나 단어를 줄여서 500자 이내로 맞추세요.
                    3. **서론 금지**: '다듬은 결과입니다'와 같은 설명 없이 **오직 다듬어진 본문만** 출력하세요.
                    4. **어미 유지**: 원문의 종결 어미(예: '-한다', '-해요')를 **반드시 그대로 유지**하세요.
                    5. **담백한 문체**: 화려한 표현으로 바꾸지 말고 자연스럽고 담백한 한국어로 교정하세요.
                    내용: \n\n ${text}`
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
