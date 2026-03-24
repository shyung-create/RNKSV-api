const axios = require('axios');
const cheerio = require('cheerio');

// Comprehensive Book Mapping (Korean/English/Abbr)
const BIBLE_MAP = {
    // 구약성경 (Old Testament)
    "창세기": ["창세기", "gen"], "창": ["창세기", "gen"], "Genesis": ["창세기", "gen"], "Gen": ["창세기", "gen"], "Gn": ["창세기", "gen"],
    "출애굽기": ["출애굽기", "exo"], "출": ["출애굽기", "exo"], "Exodus": ["출애굽기", "exo"], "Exo": ["출애굽기", "exo"], "Ex": ["출애굽기", "exo"],
    "레위기": ["레위기", "lev"], "레": ["레위기", "lev"], "Leviticus": ["레위기", "lev"], "Lev": ["레위기", "lev"], "Lv": ["레위기", "lev"],
    "민수기": ["민수기", "num"], "민": ["민수기", "num"], "Numbers": ["민수기", "num"], "Num": ["민수기", "num"], "Nm": ["민수기", "num"],
    "신명기": ["신명기", "deu"], "신": ["신명기", "deu"], "Deuteronomy": ["신명기", "deu"], "Deu": ["신명기", "deu"], "Dt": ["신명기", "deu"],
    "여호수아": ["여호수아", "jos"], "여": ["여호수아", "jos"], "Joshua": ["여호수아", "jos"], "Jos": ["여호수아", "jos"], "Josh": ["여호수아", "jos"],
    "사사기": ["사사기", "jdg"], "사": ["사사기", "jdg"], "Judges": ["사사기", "jdg"], "Jdg": ["사사기", "jdg"], "Judg": ["사사기", "jdg"],
    "룻기": ["룻기", "rut"], "룻": ["룻기", "rut"], "Ruth": ["룻기", "rut"], "Rut": ["룻기", "rut"], "Ru": ["룻기", "rut"],
    "사무엘상": ["사무엘상", "1sa"], "삼상": ["사무엘상", "1sa"], "1 Samuel": ["사무엘상", "1sa"], "1Sam": ["사무엘상", "1sa"], "1Sa": ["사무엘상", "1sa"],
    "사무엘하": ["사무엘하", "2sa"], "삼하": ["사무엘하", "2sa"], "2 Samuel": ["사무엘하", "2sa"], "2Sam": ["사무엘하", "2sa"], "2Sa": ["사무엘하", "2sa"],
    "열왕기상": ["열왕기상", "1ki"], "왕상": ["열왕기상", "1ki"], "1 Kings": ["열왕기상", "1ki"], "1Ki": ["열왕기상", "1ki"],
    "열왕기하": ["열왕기하", "2ki"], "왕하": ["열왕기하", "2ki"], "2 Kings": ["열왕기하", "2ki"], "2Ki": ["열왕기하", "2ki"],
    "역대상": ["역대상", "1ch"], "대상": ["역대상", "1ch"], "1 Chronicles": ["역대상", "1ch"], "1Ch": ["역대상", "1ch"],
    "역대하": ["역대하", "2ch"], "대하": ["역대하", "2ch"], "2 Chronicles": ["역대하", "2ch"], "2Ch": ["역대하", "2ch"],
    "에스라": ["에스라", "ezr"], "스": ["에스라", "ezr"], "Ezra": ["에스라", "ezr"], "Ezr": ["에스라", "ezr"],
    "느헤미야": ["느헤미야", "neh"], "느": ["느헤미야", "neh"], "Nehemiah": ["느헤미야", "neh"], "Neh": ["느헤미야", "neh"],
    "에스더": ["에스더", "est"], "에": ["에스더", "est"], "Esther": ["에스더", "est"], "Est": ["에스더", "est"],
    "욥기": ["욥기", "job"], "욥": ["욥기", "job"], "Job": ["욥기", "job"],
    "시편": ["시편", "psa"], "시": ["시편", "psa"], "Psalms": ["시편", "psa"], "Psa": ["시편", "psa"], "Ps": ["시편", "psa"],
    "잠언": ["잠언", "pro"], "잠": ["잠언", "pro"], "Proverbs": ["잠언", "pro"], "Pro": ["잠언", "pro"], "Pr": ["잠언", "pro"],
    "전도서": ["전도서", "ecc"], "전": ["전도서", "ecc"], "Ecclesiastes": ["전도서", "ecc"], "Ecc": ["전도서", "ecc"], "Ec": ["전도서", "ecc"],
    "아가": ["아가", "sng"], "아": ["아가", "sng"], "Song of Songs": ["아가", "sng"], "Sng": ["아가", "sng"], "Song": ["아가", "sng"],
    "이사야": ["이사야", "isa"], "사": ["이사야", "isa"], "Isaiah": ["이사야", "isa"], "Isa": ["이사야", "isa"], "Is": ["이사야", "isa"],
    "예레미야": ["예레미야", "jer"], "렘": ["예레미야", "jer"], "Jeremiah": ["예레미야", "jer"], "Jer": ["예레미야", "jer"], "Jr": ["예레미야", "jer"],
    "예레미야애가": ["예레미야애가", "lam"], "애": ["예레미야애가", "lam"], "Lamentations": ["예레미야애가", "lam"], "Lam": ["예레미야애가", "lam"],
    "에스겔": ["에스겔", "ezk"], "겔": ["에스겔", "ezk"], "Ezekiel": ["에스겔", "ezk"], "Ezk": ["에스겔", "ezk"], "Ez": ["에스겔", "ezk"],
    "다니엘": ["다니엘", "dan"], "단": ["다니엘", "dan"], "Daniel": ["다니엘", "dan"], "Dan": ["다니엘", "dan"], "Dn": ["다니엘", "dan"],
    "호세아": ["호세아", "hos"], "호": ["호세아", "hos"], "Hosea": ["호세아", "hos"], "Hos": ["호세아", "hos"], "Ho": ["호세아", "hos"],
    "요엘": ["요엘", "jol"], "요엘": ["요엘", "jol"], "Joel": ["요엘", "jol"], "Jol": ["요엘", "jol"], "Jl": ["요엘", "jol"],
    "아모스": ["아모스", "amo"], "암": ["아모스", "amo"], "Amos": ["아모스", "amo"], "Amo": ["아모스", "amo"], "Am": ["아모스", "amo"],
    "오바댜": ["오바댜", "oba"], "오": ["오바댜", "oba"], "Obadiah": ["오바댜", "oba"], "Oba": ["오바댜", "oba"], "Ob": ["오바댜", "oba"],
    "요나": ["요나", "jon"], "욘": ["요나", "jon"], "Jonah": ["요나", "jon"], "Jon": ["요나", "jon"],
    "미가": ["미가", "mic"], "미": ["미가", "mic"], "Micah": ["미가", "mic"], "Mic": ["미가", "mic"],
    "나훔": ["나훔", "nam"], "나": ["나훔", "nam"], "Nahum": ["나훔", "nam"], "Nam": ["나훔", "nam"], "Na": ["나훔", "nam"],
    "하박국": ["하박국", "hab"], "하": ["하박국", "hab"], "Habakkuk": ["하박국", "hab"], "Hab": ["하박국", "hab"],
    "스바냐": ["스바냐", "zep"], "습": ["스바냐", "zep"], "Zephaniah": ["스바냐", "zep"], "Zep": ["스바냐", "zep"], "Zp": ["스바냐", "zep"],
    "학개": ["학개", "hag"], "학": ["학개", "hag"], "Haggai": ["학개", "hag"], "Hag": ["학개", "hag"], "Hg": ["학개", "hag"],
    "스가랴": ["스가랴", "zec"], "슥": ["스가랴", "zec"], "Zechariah": ["스가랴", "zec"], "Zec": ["스가랴", "zec"], "Zc": ["스가랴", "zec"],
    "말라기": ["말라기", "mal"], "말": ["말라기", "mal"], "Malachi": ["말라기", "mal"], "Mal": ["말라기", "mal"], "Ml": ["말라기", "mal"],

    // 신약성경 (New Testament)
    "마태복음": ["마태복음", "mat"], "마": ["마태복음", "mat"], "Matthew": ["마태복음", "mat"], "Mat": ["마태복음", "mat"], "Mt": ["마태복음", "mat"],
    "마가복음": ["마가복음", "mrk"], "막": ["마가복음", "mrk"], "Mark": ["마가복음", "mrk"], "Mrk": ["마가복음", "mrk"], "Mk": ["마가복음", "mrk"],
    "누가복음": ["누가복음", "luk"], "누": ["누가복음", "luk"], "Luke": ["누가복음", "luk"], "Luk": ["누가복음", "luk"], "Lk": ["누가복음", "luk"],
    "요한복음": ["요한복음", "jhn"], "요": ["요한복음", "jhn"], "John": ["요한복음", "jhn"], "Jhn": ["요한복음", "jhn"], "Jn": ["요한복음", "jhn"],
    "사도행전": ["사도행전", "act"], "행": ["사도행전", "act"], "Acts": ["사도행전", "act"], "Act": ["사도행전", "act"], "Ac": ["사도행전", "act"],
    "로마서": ["로마서", "rom"], "롬": ["로마서", "rom"], "Romans": ["로마서", "rom"], "Rom": ["로마서", "rom"], "Ro": ["로마서", "rom"],
    "고린도전서": ["고린도전서", "1co"], "고전": ["고린도전서", "1co"], "1 Corinthians": ["고린도전서", "1co"], "1Cor": ["고린도전서", "1co"], "1Co": ["고린도전서", "1co"],
    "고린도후서": ["고린도후서", "2co"], "고후": ["고린도후서", "2co"], "2 Corinthians": ["고린도후서", "2co"], "2Cor": ["고린도후서", "2co"], "2Co": ["고린도후서", "2co"],
    "갈라디아서": ["갈라디아서", "gal"], "갈": ["갈라디아서", "gal"], "Galatians": ["갈라디아서", "gal"], "Gal": ["갈라디아서", "gal"], "Ga": ["갈라디아서", "gal"],
    "에베소서": ["에베소서", "eph"], "엡": ["에베소서", "eph"], "Ephesians": ["에베소서", "eph"], "Eph": ["에베소서", "eph"], "Ep": ["에베소서", "eph"],
    "빌립보서": ["빌립보서", "php"], "빌": ["빌립보서", "php"], "Philippians": ["빌립보서", "php"], "Phil": ["빌립보서", "php"], "Php": ["빌립보서", "php"],
    "골로새서": ["골로새서", "col"], "골": ["골로새서", "col"], "Colossians": ["골로새서", "col"], "Col": ["골로새서", "col"], "Cl": ["골로새서", "col"],
    "데살로니가전서": ["데살로니가전서", "1th"], "살전": ["데살로니가전서", "1th"], "1 Thessalonians": ["데살로니가전서", "1th"], "1Thess": ["데살로니가전서", "1th"], "1Th": ["데살로니가전서", "1th"],
    "데살로니가후서": ["데살로니가후서", "2th"], "살후": ["데살로니가후서", "2th"], "2 Thessalonians": ["데살로니가후서", "2th"], "2Thess": ["데살로니가후서", "2th"], "2Th": ["데살로니가후서", "2th"],
    "디모데전서": ["디모데전서", "1ti"], "딤전": ["디모데전서", "1ti"], "1 Timothy": ["디모데전서", "1ti"], "1Tim": ["디모데전서", "1ti"], "1Ti": ["디모데전서", "1ti"],
    "디모데후서": ["디모데후서", "2ti"], "딤후": ["디모데후서", "2ti"], "2 Timothy": ["디모데후서", "2ti"], "2Tim": ["디모데후서", "2ti"], "2Ti": ["디모데후서", "2ti"],
    "디도서": ["디도서", "tit"], "딛": ["디도서", "tit"], "Titus": ["디도서", "tit"], "Tit": ["디도서", "tit"], "Tt": ["디도서", "tit"],
    "빌레몬서": ["빌레몬서", "phm"], "몬": ["빌레몬서", "phm"], "Philemon": ["빌레몬서", "phm"], "Phm": ["빌레몬서", "phm"], "Pm": ["빌레몬서", "phm"],
    "히브리서": ["히브리서", "heb"], "히": ["히브리서", "heb"], "Hebrews": ["히브리서", "heb"], "Heb": ["히브리서", "heb"], "Hb": ["히브리서", "heb"],
    "야고보서": ["야고보서", "jas"], "약": ["야고보서", "jas"], "James": ["야고보서", "jas"], "Jas": ["야고보서", "jas"], "Js": ["야고보서", "jas"],
    "베드로전서": ["베드로전서", "1pe"], "벧전": ["베드로전서", "1pe"], "1 Peter": ["베드로전서", "1pe"], "1Pet": ["베드로전서", "1pe"], "1Pe": ["베드로전서", "1pe"],
    "베드로후서": ["베드로후서", "2pe"], "벧후": ["베드로후서", "2pe"], "2 Peter": ["베드로후서", "2pe"], "2Pet": ["베드로후서", "2pe"], "2Pe": ["베드로후서", "2pe"],
    "요한1서": ["요한1서", "1jn"], "요일": ["요한1서", "1jn"], "1 John": ["요한1서", "1jn"], "1Jhn": ["요한1서", "1jn"], "1Jn": ["요한1서", "1jn"],
    "요한2서": ["요한2서", "2jn"], "요이": ["요한2서", "2jn"], "2 John": ["요한2서", "2jn"], "2Jhn": ["요한2서", "2jn"], "2Jn": ["요한2서", "2jn"],
    "요한3서": ["요한3서", "3jn"], "요삼": ["요한3서", "3jn"], "3 John": ["요한3서", "3jn"], "3Jhn": ["요한3서", "3jn"], "3Jn": ["요한3서", "3jn"],
    "유다서": ["유다서", "jud"], "유": ["유다서", "jud"], "Jude": ["유다서", "jud"], "Jud": ["유다서", "jud"],
    "요한계시록": ["요한계시록", "rev"], "계": ["요한계시록", "rev"], "Revelation": ["요한계시록", "rev"], "Rev": ["요한계시록", "rev"], "Rv": ["요한계시록", "rev"]
};

exports.handler = async (event) => {
    const userQuery = event.queryStringParameters.ref; // e.g. ?ref=마 1:1-3
    if (!userQuery) return { statusCode: 400, body: "Missing reference." };

    // 1. Regex to Parse Input
    const regex = /([a-zA-Z\uAC00-\uD7A3\d\s]+)\s+(\d+):(\d+)(?:[-–—](\d+))?/;
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
