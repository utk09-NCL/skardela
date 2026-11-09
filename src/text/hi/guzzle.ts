import { samples } from "../samples";
import { symbols } from "../symbols";

// The text of Guzzle in Hindi. See "src/text/en/guzzle.ts" for the English text and the comments.
// The words of Guzzle are English words, thus the letters stay A to Z.
export const guzzle = {
  name: "Guzzle",
  summary: "बीच के अक्षर पर मिलने वाले चार शब्द खोजें। कम से कम गलतियाँ करें।",
  rules: [
    "एक ही लंबाई के चार शब्द बीच के अक्षर पर एक-दूसरे को काटते हैं।",
    "तीर दिखाता है कि हर शब्द कहाँ से शुरू होता है। किसी शब्द का सुराग देखने के लिए उसका खाना चुनें।",
    "कम से कम गलतियों के साथ सभी खानों को हरा बनाएँ।",
  ],
  rulesKey: [
    { text: "सही", sample: samples.guzzle.correct },
    { text: "इस शब्द में है, पर दूसरे खाने में", sample: samples.guzzle.present },
    { text: "इस शब्द में नहीं है", sample: samples.guzzle.absent },
  ],
  moreRules: {
    label: "और नियम: मोड, कुंजियाँ, गलतियाँ",
    rules: [
      `शब्द आड़े, खड़े और दोनों तिरछी दिशाओं में चलते हैं। तीर (${Object.values(symbols.guzzle.arrows).join(" ")}) शब्द पढ़ने की दिशा दिखाता है।`,
      "शुरू करने से पहले एक मोड चुनें। मोड चुनते ही टाइमर शुरू हो जाता है।",
      "बैंक के साथ: अक्षर कुंजियाँ सिर्फ़ वे अक्षर दिखाती हैं जिनकी शब्दों को अभी ज़रूरत है। जब एक से ज़्यादा खानों को किसी अक्षर की ज़रूरत हो, तो कुंजी पर संख्या दिखाती है कि कितने खानों को उसकी ज़रूरत है।",
      "बैंक के बिना: अक्षर कुंजियाँ A से Z तक सभी अक्षर दिखाती हैं। शब्द खोजने के लिए सुरागों का उपयोग करें।",
      "खाने में एक अक्षर डालें। हरे अक्षर के बाद कर्सर उसी शब्द के अगले खाने पर चला जाता है।",
      `अक्षर कुंजियाँ दिखाती हैं कि आप चुने गए खाने के बारे में क्या जानते हैं। ${symbols.guzzle.absent}: अक्षर इस खाने में नहीं है। ${symbols.guzzle.present}: शब्द में यह अक्षर है।`,
      "गलत अक्षर एक गलती जोड़ता है। जिस अक्षर को आप पहले से गलत जानते हैं, वह गलती नहीं जोड़ता।",
    ],
  },
  score_one: "{{count}} गलती",
  score_other: "{{count}} गलतियाँ",
  scoreWord_one: "गलती",
  scoreWord_other: "गलतियाँ",
  boardLabel: "Guzzle बोर्ड",
  modeLabel: "आप कैसे खेलना चाहते हैं?",
  modes: { bank: "बैंक के साथ", noBank: "बैंक के बिना" },
  bankLabel: "अक्षर बैंक",
  keysLabel: "अक्षर",
  key: {
    put: "चुने गए खाने में {{letter}} डालें",
    left: "{{count}} बाकी",
    wrong: "इस खाने में नहीं",
    inWord: "इस शब्द में है",
  },
  marks: {
    correct: "हरा, सही",
    present: "पीला, दूसरे खाने में",
    absent: "लाल, इस शब्द में नहीं",
  },
  lines: {
    across: "आड़ा शब्द",
    down: "खड़ा शब्द",
    diagonalDown: "ऊपर बाएँ से तिरछा शब्द",
    diagonalUp: "नीचे बाएँ से तिरछा शब्द",
  },
  square: {
    position: "पंक्ति {{row}}, स्तंभ {{column}}",
    empty: "खाली",
    fixed: "तय",
    start: "{{line}} की शुरुआत",
  },
  cluesLabel: "सुराग",
  clueLines: {
    across: "आड़ा",
    down: "खड़ा",
    diagonalDown: "ऊपर बाएँ से तिरछा",
    diagonalUp: "नीचे बाएँ से तिरछा",
  },
  position: "{{length}} में से अक्षर {{position}}",
  status: {
    choose: "शुरू करने के लिए एक मोड चुनें।",
    start: "एक खाना चुनें। फिर एक अक्षर टाइप करें या चुनें।",
    correct: "{{letter}} सही है।",
    present: "{{line}} में {{letter}} है, पर दूसरे खाने में।",
    absent: "{{line}} में {{letter}} नहीं है।",
    solved: "आपने पहेली हल कर ली। {{mode}}, {{mistakes}}।",
  },
};
