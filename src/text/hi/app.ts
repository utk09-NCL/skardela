import { symbols } from "../symbols";

// The text of the app frame in Hindi. See "src/text/en/app.ts" for the English text and the comments.
export const app = {
  siteName: "Skardela",
  skipLink: "मुख्य सामग्री पर जाएँ",
  nav: {
    label: "मुख्य",
    stats: "आपके आँकड़े",
  },
  language: { label: "भाषा" },
  streak: { word: " दिन की लगातार जीत" },
  levels: { easy: "आसान", medium: "मध्यम", hard: "कठिन" },
  share: {
    site: "skardela.netlify.app",
    title: "Skardela",
    titleWithDate: "Skardela · {{date, shortDate}}",
    puzzle: "{{typeName}} #{{number}}, {{level}}",
    solvedIn: "{{time}} में हल किया",
    solvedInWith: "{{time}} में {{score}} के साथ हल किया",
    levelTime: "{{level}} {{time}}",
    copied: "कॉपी हो गया",
    copiedMessage: "परिणाम कॉपी हो गया है। अब आप इसे पेस्ट कर सकते हैं।",
    sharedMessage: "परिणाम शेयर हो गया है।",
    failed: "कॉपी नहीं हुआ",
    failedMessage: "आपके ब्राउज़र ने Skardela को परिणाम कॉपी नहीं करने दिया।",
  },
  theme: {
    label: "थीम",
    options: {
      system: `${symbols.theme.system} सिस्टम`,
      light: `${symbols.theme.light} लाइट`,
      dark: `${symbols.theme.dark} डार्क`,
    },
  },
  footer: {
    tagline: "Skardela · रोज़ मुफ़्त पहेलियाँ · न खाता, न डाउनलोड",
    source: { label: "GitHub पर सोर्स कोड", href: "https://github.com/utk09-NCL/skardela" },
    content: "© {{year}} Skardela. यह वेबसाइट बिना कुकीज़ के एनालिटिक्स का उपयोग करती है।",
  },
  storage: {
    unavailable:
      "आपका ब्राउज़र Skardela को डेटा सेव नहीं करने देता। आप खेल सकते हैं, पर पेज बंद करने पर आपकी प्रगति मिट जाएगी।",
    full: 'ब्राउज़र का स्टोरेज भरा हुआ है, इसलिए Skardela आपकी नई प्रगति सेव नहीं कर सकता। "आपके आँकड़े" में "मेरा डेटा एक्सपोर्ट करें" चुनें, फिर "मेरा डेटा मिटाएँ" चुनें।',
    outdated:
      "किसी दूसरे टैब में Skardela का नया संस्करण खुला है। अपनी प्रगति सेव करने के लिए यह पेज फिर से लोड करें।",
    statsLink: "अपने आँकड़ों पर जाएँ",
    close: "संदेश बंद करें",
  },
  analyticsNotice: {
    title: "यह वेबसाइट एनालिटिक्स का उपयोग करती है",
    body: "Skardela विज़िट गिनने और यह देखने के लिए एनालिटिक्स का उपयोग करता है कि लोग कौन-सी पहेलियाँ खेलते हैं। एनालिटिक्स टूल कुकीज़ का उपयोग नहीं करता, और यह दूसरी वेबसाइटों पर आपका पीछा नहीं करता।",
    ok: "ठीक है",
  },
  notFound: {
    title: "पेज नहीं मिला",
    body: "आप जो पेज ढूँढ रहे हैं, वह मौजूद नहीं है।",
    homeLink: "होम पेज पर जाएँ",
  },
  routeError: {
    title: "कुछ गलत हो गया",
    body: "एक त्रुटि के कारण यह पेज रुक गया। फिर से कोशिश करने के लिए पेज दोबारा लोड करें।",
    homeLink: "होम पेज पर जाएँ",
  },
  pageTitle: "{{title}} | {{siteName}}",
};
