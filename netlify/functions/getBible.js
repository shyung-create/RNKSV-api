const axios = require('axios');
const cheerio = require('cheerio');

// Load the map
const bibleMapData = require('./bible_map.json');

const BOOK_NAMES = {
    "genesis": "창세기", "gen": "창세기", "gn": "창세기", "창": "창세기",
    "exodus": "출애굽기", "exo": "출애굽기", "ex": "출애굽기", "출": "출애굽기",
    "leviticus": "레위기", "lev": "레위기", "lv": "레위기", "레": "레위기",
    "numbers": "민수기", "num": "민수기", "nm": "민수기", "민": "민수기",
    "deuteronomy": "신명기", "deu": "신명기", "dt": "신명기", "신": "신명기",
    "joshua": "여호수아", "jos": "여호수아", "여": "여호수아",
    "judges": "사사기", "jdg": "사사기", "사": "사사기",
    "ruth": "룻기", "rut": "룻기", "룻": "룻기",
    "1 samuel": "사무엘상", "1sam": "사무엘상", "1sa": "사무엘상", "삼상": "사무엘상",
    "2 samuel": "사무엘하", "2sam": "사무엘하", "2sa": "사무엘하", "삼하": "사무엘하",
    "1 kings": "열왕기상", "1ki": "열왕기상", "왕상": "열왕기상",
    "2 kings": "열왕기하", "2ki": "열왕기하", "왕하": "열왕기하",
    "1 chronicles": "역대상", "1ch": "역대상", "대상": "역대상",
    "2 chronicles": "역대하", "2ch": "역대하", "대하": "역대하",
    "ezra": "에스라", "ezr": "에스라", "스": "에스라",
    "nehemiah": "느헤미야", "neh": "느헤미야", "느": "느헤미야",
    "esther": "에스더", "est": "에스더", "에": "에스더",
    "job": "욥기", "욥": "욥기",
    "psalms": "시편", "psa": "시편", "ps": "시편", "시": "시편",
    "proverbs": "잠언", "pro": "잠언", "pr": "잠언", "잠": "잠언",
    "ecclesiastes": "전도서", "ecc": "전도서", "ec": "전도서", "전": "전도서",
    "song of songs": "아가", "song": "아가", "sng": "아가", "아": "아가",
    "isaiah": "이사야", "isa": "이사야", "is": "이사야", "사": "이사야",
    "jeremiah": "예레미야", "jer": "예레미야", "jr": "예레미야", "렘": "예레미야",
    "lamentations": "예레미야애가", "lam": "예레미야애가", "애": "예레미야애가",
    "ezekiel": "에스겔", "ezk": "에스겔", "ez": "에스겔", "겔": "에스겔",
    "daniel": "다니엘", "dan": "다니엘", "dn": "다니엘", "단": "다니엘",
    "hosea": "호세아", "hos": "호세아", "ho": "호세아", "호": "호세아",
    "joel": "요엘", "jl": "요엘", "요엘": "요엘",
    "amos": "아모스", "amo": "아모스", "am": "아모스", "암": "아모스",
    "obadiah": "오바댜", "oba": "오바댜", "ob": "오바댜", "오": "오바댜",
    "jonah": "요나", "jon": "요나", "욘": "요나",
    "micah": "미가", "mic": "미가", "미": "미가",
    "nahum": "나훔", "nam": "나훔", "na": "나훔", "나": "나훔",
    "habakkuk": "하박국", "hab": "하박국", "하": "하박국",
    "zephaniah": "스바냐", "zep": "스바냐", "zp": "스바냐", "습": "스바냐",
    "haggai": "학개", "hag": "학개", "hg": "학개", "학": "학개",
    "zechariah": "스가랴", "zec": "스가랴", "zc": "스가랴", "슥": "스가랴",
    "malachi": "말라기", "mal": "말라기", "ml": "말라기", "말": "말라기",
    "matthew": "마태복음", "matt": "마태복음", "mt": "마태복음", "마": "마태복음",
    "mark": "마가복음", "mrk": "마가복음", "mk": "마가복음", "막": "마가복음",
    "luke": "누가복음", "luk": "누가복음", "lk": "누가복음", "누": "누가복음",
    "john": "요한복음", "jhn": "요한복음", "jn": "요한복음", "요": "요한복음",
    "acts": "사도행전", "act": "사도행전", "ac": "사도행전", "행": "사도행전",
    "romans": "로마서", "rom": "로마서", "ro": "로마서", "롬": "로마서",
    "1 corinthians": "고린도전서", "1cor": "고린도전서", "1co": "고린도전서", "고전": "고린도전서",
    "2 corinthians": "고린도후서", "2cor": "고린도후서", "2co": "고린도후서", "고후": "고린도후서",
    "galatians": "갈라디아서", "gal": "갈라디아서", "ga": "갈라디아서", "갈": "갈라디아서",
    "ephesians": "에베소서", "eph": "에베소서", "ep": "에베소서", "엡": "에베소서",
    "philippians": "빌립보서", "phil": "빌립보서", "php": "빌립보서", "빌": "빌립보서",
    "colossians": "골로새서", "col": "골로새서", "cl": "골로새서", "골": "골로새서",
    "1 thessalonians": "데살로니가전서", "1thess": "데살로니가전서", "1th": "데살로니가전서", "살전": "데살로니가전서",
    "2 thessalonians": "데살로니가후서", "2thess": "데살로니가후서", "2th": "데살로니가후서", "살후": "데살로니가후서",
    "1 timothy": "디모데전서", "1tim": "디모데전서", "1ti": "디모데전서", "딤전": "디모데전서",
    "2 timothy": "디모데후서", "2tim": "디모데후서", "2ti": "디모데후서", "딤후": "디모데후서",
    "titus": "디도서", "tit": "디도서", "tt": "디도서", "딛": "디도서",
    "philemon": "빌레몬서", "phm": "빌레몬서", "pm": "빌레몬서", "몬": "빌레몬서",
    "hebrews": "히브리서", "heb": "히브리서", "hb": "히브리서", "히": "히브리서",
    "james": "야고보서", "jas": "야고보서", "js": "야고보서", "약": "야고보서",
    "1 peter": "베드로전서", "1pet": "베드로전서", "1pe": "베드로전서", "벧전": "베드로전서",
    "2 peter": "베드로후서", "2pet": "베드로후서", "2pe": "베드로후서", "벧후": "베드로후서",
    "1 john": "요한1서", "1jn": "요한1서", "요일": "요한1서",
    "2 john": "요한2서", "2jn": "요한2서", "요이": "요한2서",
    "3 john": "요한3서", "3jn": "요한3서", "요삼": "요한3서",
    "jude": "유다서", "jud": "유다서", "유": "유다서",
    "revelation": "요한계시록", "rev": "요한계시록", "rv": "요한계시록", "계": "요한계시록"
};


exports.handler = async (event) => {
    const userQuery = event.queryStringParameters.ref;
    if (!userQuery) return { statusCode: 400, body: "Error: No reference provided." };

    const regex = /([a-zA-Z\uAC00-\uD7A3\d\s]+)\s+(\d+):(\d+)(?:[-–—](\d+))?/;
    const match = userQuery.match(regex);
    if (!match) return { statusCode: 400, body: "Error: Invalid Format." };

    let [_, bookRaw, chapter, startV, endV] = match;
    bookRaw = bookRaw.trim().toLowerCase();
    const start = parseInt(startV);
    const end = endV ? parseInt(endV) : start;

    // 1. 한국어 정식 명칭으로 변환
    const fullKoreanBook = BOOK_NAMES[bookRaw] || bookRaw;
    
    // 2. JSON 키 형식에 맞게 변환 (중요!)
    // 예: "1" -> "01", "10" -> "10"
    const paddedChapter = chapter.toString().padStart(2, '0');
    // JSON에 있는 "표준새번역 창세기 01" 형식과 일치시킴
    const searchKey = `표준새번역 ${fullKoreanBook} ${paddedChapter}`;

    const urlId = bibleMapData[searchKey];

    if (!urlId) {
        return { 
            statusCode: 404, 
            body: `Error: Could not find URL for '${searchKey}' in bible_map.json.` 
        };
    }

    // JSON의 ID 값에 이미 ?page=1이 포함되어 있어도 정상 작동합니다.
    const url = `https://nocr.net/kornks/${urlId}`;

    try {
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(data);
        let verses = [];

        // 본문 추출 로직
        $('p, div, span, li').each((i, el) => {
            const rawText = $(el).text().trim();
            const vMatch = rawText.match(/^(\d+[:.]?)?(\d+)\s+(.*)/);
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

        if (verses.length === 0) {
            return { statusCode: 404, body: `Error: No text found for ${fullKoreanBook} ${chapter}:${start}-${end}.` };
        }

        verses.sort((a, b) => a.num - b.num);
        const resultText = verses.map(v => v.text).join('\n');
        const header = `'${fullKoreanBook} ${chapter}:${start}-${end}'`;

        return {
            statusCode: 200,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
            body: `${header}\n${resultText}`
        };
    } catch (error) {
        return { statusCode: 500, body: `Error: Fetch failed. (${error.message})` };
    }
};
