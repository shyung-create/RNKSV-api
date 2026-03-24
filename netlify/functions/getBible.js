const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Load the map you generated
const bibleMapData = require('./bible_map.json');

// Book Name normalization (same as before)
const BOOK_NAMES = {
    "Matthew": "마태복음", "Mt": "마태복음", "마": "마태복음",
    "Isaiah": "이사야", "Isa": "이사야", "사": "이사야",
    "Philippians": "빌립보서", "Php": "빌립보서", "빌": "빌립보서",
    // ... add other aliases here
};

exports.handler = async (event) => {
    const userQuery = event.queryStringParameters.ref;
    if (!userQuery) return { statusCode: 400, body: "No reference provided." };

    // Regex to handle "Matthew 2:1-5"
    const regex = /([a-zA-Z\uAC00-\uD7A3\d\s]+)\s+(\d+):(\d+)(?:[-–—](\d+))?/;
    const match = userQuery.match(regex);
    if (!match) return { statusCode: 400, body: "Invalid Format." };

    let [_, bookRaw, chapter, startV, endV] = match;
    bookRaw = bookRaw.trim();
    const start = parseInt(startV);
    const end = endV ? parseInt(endV) : start;

    // 1. Convert English/Abbr to Full Korean Name
    const fullKoreanBook = BOOK_NAMES[bookRaw] || bookRaw;
    
    // 2. Lookup the URL ID from our Map
    const mapKey = `${fullKoreanBook} ${chapter}`;
    const urlId = bibleMapData[mapKey];

    if (!urlId) {
        return { statusCode: 404, body: `Error: Could not find URL for ${mapKey}` };
    }

    const url = `https://nocr.net/kornks/${urlId}`;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        let verses = [];

        // Scrape logic
        $('p, div, span').each((i, el) => {
            const text = $(el).text().trim();
            const vMatch = text.match(/^(\d+[:.]?)?(\d+)\s+(.*)/);
            if (vMatch) {
                const vNum = parseInt(vMatch[2]);
                const content = vMatch[3].trim();
                if (vNum >= start && vNum <= end) {
                    if (!verses.some(v => v.num === vNum)) {
                        verses.push({ num: vNum, text: content });
                    }
                }
            }
        });

        const header = `'${fullKoreanBook} ${chapter}:${start}-${end}'`;
        const resultText = verses.sort((a,b) => a.num - b.num).map(v => v.text).join('\n');

        return {
            statusCode: 200,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
            body: `${header}\n${resultText}`
        };
    } catch (err) {
        return { statusCode: 500, body: "Fetch Error." };
    }
};
