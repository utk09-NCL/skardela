import { symbols } from "../symbols";

const { "+": add, "-": subtract, "×": multiply, "÷": divide } = symbols.numpuz.operators;

// The text of Numpuz in Hindi. See "src/text/en/numpuz.ts" for the English text and the comments.
export const numpuz = {
  name: "Numpuz",
  summary: `लक्ष्य संख्या तक पहुँचने के लिए हर खाली जगह में ${add} ${subtract} ${multiply} या ${divide} भरें।`,
  rules: [
    `संख्याओं के बीच हर खाली जगह में ${add} ${subtract} ${multiply} या ${divide} भरें।`,
    "समीकरण लक्ष्य संख्या के बराबर होना चाहिए।",
    `${multiply} और ${divide} की गणना ${add} और ${subtract} से पहले होती है।`,
  ],
  rulesKey: [],
  moreRules: {
    label: "और नियम: खाली जगहें और जाँच",
    rules: [
      "हर खाली जगह में एक चिह्न आता है।",
      "एक खाली जगह चुनें। फिर उसमें डालने के लिए एक चिह्न चुनें।",
      'हर खाली जगह भरें। फिर "जाँचें" चुनें।',
      "गलत उत्तर वाली हर जाँच एक गलती है। फिर से जाँचने से पहले कोई चिह्न बदलें।",
      `कीबोर्ड से: खाली जगह पर +, -, * या / टाइप करें। * से ${multiply} और / से ${divide} मिलता है।`,
    ],
  },
  score_one: "{{count}} गलती",
  score_other: "{{count}} गलतियाँ",
  scoreWord_one: "गलती",
  scoreWord_other: "गलतियाँ",
  boardLabel: "Numpuz बोर्ड",
  target: "लक्ष्य: {{target}}",
  operatorNames: { "+": "जोड़", "-": "घटा", "×": "गुणा", "÷": "भाग" },
  blank: "खाली जगह {{position}}, {{operator}}",
  empty: "खाली",
  keysLabel: "चिह्न",
  key: "चुनी गई खाली जगह में {{name}} डालें",
  checkButton: "जाँचें",
  status: {
    start: "एक खाली जगह चुनें। फिर एक चिह्न टाइप करें या चुनें।",
    incomplete: "जाँचने से पहले हर खाली जगह भरें।",
    wrong: "अभी नहीं। समीकरण लक्ष्य के बराबर नहीं है। कोई चिह्न बदलें और फिर से जाँचें। गलतियाँ: {{count}}।",
    solved: "आपने {{mistakes}} के साथ पहेली हल कर ली। समीकरण लक्ष्य के बराबर है।",
  },
};
