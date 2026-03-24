const axios = require('axios');
const cheerio = require('cheerio');

// Load the map
const bibleMapData = require('./bible_map.json');
const BOOK_NAMES = require('./bookNames.json'); // New separate file

exports.handler = async (event) => {
    const userQuery = event.queryStringParameters.ref;
    if (!userQuery) return { statusCode: 400, body: "Error: No reference." };

    const regex = /([a-zA-Z\uAC00-\uD7A3\d\s]+)\s+(\d+):(\d+)(?:[-–—](\d+))?/;
    const match = userQuery.match(regex);
    if (!match) return { statusCode: 400, body: "Error: Invalid Format." };

    let [_, bookRaw, chapter, startV, endV] = match;
    bookRaw = bookRaw.trim().toLowerCase();
    const start = parseInt(startV);
    const end = endV ? parseInt(endV) : start;

    const fullKoreanBook = BOOK_NAMES[bookRaw] || bookRaw;
    const paddedChapter = chapter.toString().padStart(2, '0');
    const searchKey = `표준새번역 ${fullKoreanBook} ${paddedChapter}`;
    const urlId = bibleMapData[searchKey];

    if (!urlId) return { statusCode: 404, body: `Error: ID not found for ${searchKey}` };

    try {
        const { data } = await axios.get(`https://nocr.net/kornks/${urlId}`, { 
            headers: { 'User-Agent': 'Mozilla/5.0' } 
        });
        const $ = cheerio.load(data);
        
        // Use a Set to store unique verses in order
        let versesFound = [];

        // FOCUS only on the content body to avoid grabbing navigation or headers
        const contentBody = $('.entry-content').text() || $('body').text();

        // 1. CLEANING: Remove all < > tags and their content immediately
        const cleanBody = contentBody.replace(/<[^>]*>/g, '');

        // 2. PARSING: Split the text by verse numbers
        // This looks for numbers like "1 ", "2 ", "1:1 ", etc.
        const parts = cleanBody.split(/(?=\n\d+\s|\s\d+\s|^ \d+\s|\d+:\d+\s)/);

        parts.forEach(part => {
            const trimmedPart = part.trim();
            // Regex to find: (Chapter:Verse or VerseNum)(Space)(Text)
            const vMatch = trimmedPart.match(/^(\d+[:.]\s*)?(\d+)\s+(.*)/s);
            
            if (vMatch) {
                const vNum = parseInt(vMatch[2]);
                const vText = vMatch[3].trim();

                // 3. STRICT RANGE FILTER
                if (vNum >= start && vNum <= end) {
                    // Check for duplicates
                    if (!versesFound.some(v => v.num === vNum)) {
                        versesFound.push({ num: vNum, text: vText });
                    }
                }
            }
        });

        if (versesFound.length === 0) {
            return { statusCode: 404, body: `No verses found in range ${start}-${end}.` };
        }

        // 4. FORMATTING: Remove the verse numbers from the start of the output
        versesFound.sort((a, b) => a.num - b.num);
        const finalLines = versesFound.map(v => v.text).join('\n');
        const header = `[${fullKoreanBook} ${chapter}:${start}-${end}]`;

        return {
            statusCode: 200,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
            body: `${header}\n${finalLines}`
        };

    } catch (error) {
        return { statusCode: 500, body: `Fetch failed: ${error.message}` };
    }
};
