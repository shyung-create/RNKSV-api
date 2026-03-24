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
                    1. 공백과 기호를 포함하여 **최대 500자 이내**로 작성하세요. 내용이 너무 길면 핵심 위주로 요약하세요.
                    2. '사용자님의 글을 다듬었습니다'와 같은 서론은 절대 하지 말고, 오직 **다듬어진 본문만** 출력하세요.
                    3. 원문의 종결 어미(예: '-한다', '-해요')를 **그대로 유지**하세요.
                    4. 자연스럽고 담백한 한국어 문체를 사용하세요.

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
