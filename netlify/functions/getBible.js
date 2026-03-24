const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Load the map you generated
const bibleMapData = require('./bible_map.json');

// Book Name normalization (same as before)
const BOOK_NAMES = {
    // 구약성경 (Old Testament)
    "Genesis": "창세기", "Gen": "창세기", "Gn": "창세기", "창": "창세기",
    "Exodus": "출애굽기", "Exo": "출애굽기", "Ex": "출애굽기", "출": "출애굽기",
    "Leviticus": "레위기", "Lev": "레위기", "Lv": "레위기", "레": "레위기",
    "Numbers": "민수기", "Num": "민수기", "Nm": "민수기", "민": "민수기",
    "Deuteronomy": "신명기", "Deu": "신명기", "Dt": "신명기", "신": "신명기",
    "Joshua": "여호수아", "Jos": "여호수아", "여": "여호수아",
    "Judges": "사사기", "Jdg": "사사기", "사": "사사기",
    "Ruth": "룻기", "Rut": "룻기", "룻": "룻기",
    "1 Samuel": "사무엘상", "1Sam": "사무엘상", "1Sa": "사무엘상", "삼상": "사무엘상",
    "2 Samuel": "사무엘하", "2Sam": "사무엘하", "2Sa": "사무엘하", "삼하": "사무엘하",
    "1 Kings": "열왕기상", "1Ki": "열왕기상", "왕상": "열왕기상",
    "2 Kings": "열왕기하", "2Ki": "열왕기하", "왕하": "열왕기하",
    "1 Chronicles": "역대상", "1Ch": "역대상", "대상": "역대상",
    "2 Chronicles": "역대하", "2Ch": "역대하", "대하": "역대하",
    "Ezra": "에스라", "Ezr": "에스라", "스": "에스라",
    "Nehemiah": "느헤미야", "Neh": "느헤미야", "느": "느헤미야",
    "Esther": "에스더", "Est": "에스더", "에": "에스더",
    "Job": "욥기", "욥": "욥기",
    "Psalms": "시편", "Psa": "시편", "Ps": "시편", "시": "시편",
    "Proverbs": "잠언", "Pro": "잠언", "Pr": "잠언", "잠": "잠언",
    "Ecclesiastes": "전도서", "Ecc": "전도서", "Ec": "전도서", "전": "전도서",
    "Song of Songs": "아가", "Song": "아가", "Sng": "아가", "아": "아가",
    "Isaiah": "이사야", "Isa": "이사야", "Is": "이사야", "사": "이사야",
    "Jeremiah": "예레미야", "Jer": "예레미야", "Jr": "예레미야", "렘": "예레미야",
    "Lamentations": "예레미야애가", "Lam": "예레미야애가", "애": "예레미야애가",
    "Ezekiel": "에스겔", "Ezk": "에스겔", "Ez": "에스겔", "겔": "에스겔",
    "Daniel": "다니엘", "Dan": "다니엘", "Dn": "다니엘", "단": "다니엘",
    "Hosea": "호세아", "Hos": "호세아", "Ho": "호세아", "호": "호세아",
    "Joel": "요엘", "Jl": "요엘", "요엘": "요엘",
    "Amos": "아모스", "Amo": "아모스", "Am": "아모스", "암": "아모스",
    "Obadiah": "오바댜", "Oba": "오바댜", "Ob": "오바댜", "오": "오바댜",
    "Jonah": "요나", "Jon": "요나", "욘": "요나",
    "Micah": "미가", "Mic": "미가", "미": "미가",
    "Nahum": "나훔", "Nam": "나훔", "Na": "나훔", "나": "나훔",
    "Habakkuk": "하박국", "Hab": "하박국", "하": "하박국",
    "Zephaniah": "스바냐", "Zep": "스바냐", "Zp": "스바냐", "습": "스바냐",
    "Haggai": "학개", "Hag": "학개", "Hg": "학개", "학": "학개",
    "Zechariah": "스가랴", "Zec": "스가랴", "Zc": "스가랴", "슥": "스가랴",
    "Malachi": "말라기", "Mal": "말라기", "Ml": "말라기", "말": "말라기",

    // 신약성경 (New Testament)
    "Matthew": "마태복음", "Matt": "마태복음", "Mt": "마태복음", "마": "마태복음",
    "Mark": "마가복음", "Mrk": "마가복음", "Mk": "마가복음", "막": "마가복음",
    "Luke": "누가복음", "Luk": "누가복음", "Lk": "누가복음", "누": "누가복음",
    "John": "요한복음", "Jhn": "요한복음", "Jn": "요한복음", "요": "요한복음",
    "Acts": "사도행전", "Act": "사도행전", "Ac": "사도행전", "행": "사도행전",
    "Romans": "로마서", "Rom": "로마서", "Ro": "로마서", "롬": "로마서",
    "1 Corinthians": "고린도전서", "1Cor": "고린도전서", "1Co": "고린도전서", "고전": "고린도전서",
    "2 Corinthians": "고린도후서", "2Cor": "고린도후서", "2Co": "고린도후서", "고후": "고린도후서",
    "Galatians": "갈라디아서", "Gal": "갈라디아서", "Ga": "갈라디아서", "갈": "갈라디아서",
    "Ephesians": "에베소서", "Eph": "에베소서", "Ep": "에베소서", "엡": "에베소서",
    "Philippians": "빌립보서", "Phil": "빌립보서", "Php": "빌립보서", "빌": "빌립보서",
    "Colossians": "골로새서", "Col": "골로새서", "Cl": "골로새서", "골": "골로새서",
    "1 Thessalonians": "데살로니가전서", "1Thess": "데살로니가전서", "1Th": "데살로니가전서", "살전": "데살로니가전서",
    "2 Thessalonians": "데살로니가후서", "2Thess": "데살로니가후서", "2Th": "데살로니가후서", "살후": "데살로니가후서",
    "1 Timothy": "디모데전서", "1Tim": "디모데전서", "1Ti": "디모데전서", "딤전": "디모데전서",
    "2 Timothy": "디모데후서", "2Tim": "디모데후서", "2Ti": "디모데후서", "딤후": "디모데후서",
    "Titus": "디도서", "Tit": "디도서", "Tt": "디도서", "딛": "디도서",
    "Philemon": "빌레몬서", "Phm": "빌레몬서", "Pm": "빌레몬서", "몬": "빌레몬서",
    "Hebrews": "히브리서", "Heb": "히브리서", "Hb": "히브리서", "히": "히브리서",
    "James": "야고보서", "Jas": "야고보서", "Js": "야고보서", "약": "야고보서",
    "1 Peter": "베드로전서", "1Pet": "베드로전서", "1Pe": "베드로전서", "벧전": "베드로전서",
    "2 Peter": "베드로후서", "2Pet": "베드로후서", "2Pe": "베드로후서", "벧후": "베드로후서",
    "1 John": "요한1서", "1Jn": "요한1서", "요일": "요한1서",
    "2 John": "요한2서", "2Jn": "요한2서", "요이": "요한2서",
    "3 John": "요한3서", "3Jn": "요한3서", "요삼": "요한3서",
    "Jude": "유다서", "Jud": "유다서", "유": "유다서",
    "Revelation": "요한계시록", "Rev": "요한계시록", "Rv": "요한계시록", "계": "요한계시록"
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
