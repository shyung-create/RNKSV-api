const axios = require('axios');

exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { verses } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY; // We will set this in Netlify
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [{
                    text: `다음 성경 구절에 대한 짧고 통찰력 있는 해석과 묵상 포인트를 3개의 불렛 포인트로 제공해 주세요. 한국어로 답변해 주세요: \n\n ${verses}`
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
        console.error(error);
        return { statusCode: 500, body: "AI interpretation failed. Check API key." };
    }
};