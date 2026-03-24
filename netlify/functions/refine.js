const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "POST only" };

    try {
        const { text } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;

        // Using Gemini 2.5 or 3 Flash for speed
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

const payload = {
            contents: [{
                parts: [{
                    text: `다음은 사용자가 작성한 개인적인 묵상 글입니다. 
                    본래의 의도와 감정을 최대한 유지하면서, 맞춤법과 문법을 교정하고 문장을 더 매끄럽게 다듬어 주세요. 

                    지침:
                    1. '사용자님의 묵상 글을...'과 같은 서론이나 어떠한 설명도 하지 말고, 오직 다듬어진 **본문만** 출력하세요.
                    2. 원문에서 사용된 종결 어미(예: '-한다', '-해요', '-합니다' 등)를 **반드시 그대로 유지**하세요. 억지로 문체를 바꾸지 마세요.
                    3. 간결하고 담백한 한국어 문체가 되도록 하세요.

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
