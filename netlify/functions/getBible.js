const axios = require('axios');
const cheerio = require('cheerio');

// Comprehensive Book Mapping (Korean/English/Abbr)
const BIBLE_MAP = {
    "창세기": ["창세기", "gen"], "창": ["창세기", "gen"], "Gen": ["창세기", "gen"], "Genesis": ["창세기", "gen"],
    "출애굽기": ["출애굽기", "exo"], "출": ["출애굽기", "exo"], "Exo": ["출애굽기", "exo"], "Exodus": ["출애굽기", "exo"],
    "마태복음": ["마태복음", "mat"], "마": ["마태복음", "mat"], "Mat": ["마태복음", "mat"], "Matthew": ["마태복음", "mat"],
    "요한복음": ["요한복음", "jhn"], "요": ["요한복음", "jhn"], "Jhn": ["요한복음", "jhn"], "John": ["요한복음", "jhn"],
    // ... add others following this pattern
};

exports.handler = async (event) => {
    const userQuery = event.queryStringParameters.ref; // e.g. ?ref=마 1:1-3
    if (!userQuery) return { statusCode: 400, body: "Missing reference." };

    // 1. Regex to Parse Input
    const regex = /([a-zA-Z\uAC00-\uD7A3\d\s]+)\s+(\d+):(\d+)(?:-(\d+))?/;
    const match = userQuery.match(regex);
    if (!match) return { statusCode: 400, body: "Invalid Format." };

    let [_, bookRaw, chapter, startV, endV] = match;
    bookRaw = bookRaw.trim();
    endV = endV || startV;

    const bookData = BIBLE_MAP[bookRaw];
    if (!bookData) return { statusCode: 404, body: "Book not found." };

    const [fullKoreanName, webCode] = bookData;
    const url = `https://nocr.net/bible/nksv/${webCode}/${chapter}`;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        let verses = [];

        // 2. Scraping and Cleaning Logic
        // Adjust selectors based on nocr.net's actual HTML structure
        $('.verse, p, div').each((i, el) => {
            const text = $(el).text().trim();
            // Match "1:1 Text..." or "1 Text..."
            const verseMatch = text.match(/^(\d+[:.]?)?(\d+)\s+(.*)/);
            if (verseMatch) {
                const vNum = parseInt(verseMatch[2]);
                const content = verseMatch[3];
                if (vNum >= parseInt(startV) && vNum <= parseInt(endV)) {
                    verses.push(content);
                }
            }
        });

        // 3. Formatted Output
        const header = `'${fullKoreanName} ${chapter}:${startV}-${endV}'`;
        const finalOutput = [header, ...verses].join('\n');

        return {
            statusCode: 200,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
            body: finalOutput
        };
    } catch (error) {
        return { statusCode: 500, body: "Error fetching Bible data." };
    }
};