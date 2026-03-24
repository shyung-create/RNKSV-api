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
                    지나치게 화려한 표현으로 바꾸지 말고 자연스러운 한국어 문체가 되도록 해주세요: \n\n ${text}`
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
