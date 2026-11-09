import { samples } from "../samples";

const sample = samples["colour-binary"];

// The text of Colour Binary in Hindi. See "src/text/en/colour-binary.ts" for the English text and the comments.
// The sentences say "the colour is red" ("रंग लाल है"), thus the colour word does not change with the noun.
export const colourBinary = {
  name: "Colour Binary",
  summary: "हर खाने को लाल या नीला बनाएँ। हर लाइन में आधे खाने हर रंग के हों।",
  rules: [
    "हर खाने को लाल या नीला बनाएँ।",
    "हर पंक्ति और हर स्तंभ में लाल और नीले खानों की संख्या बराबर हो।",
    "एक ही रंग के तीन खाने किसी पंक्ति या स्तंभ में एक साथ नहीं हो सकते।",
  ],
  rulesKey: [
    { text: "एक बार टैप: लाल", sample: sample.red },
    { text: "दो बार: नीला", sample: sample.blue },
    { text: "तीन बार: खाली", sample: sample.empty },
  ],
  moreRules: {
    label: "और नियम: दिए गए खाने, कुंजियाँ, संकेत",
    rules: [
      "सफ़ेद बिंदु वाला खाना पहले से दिया गया है। आप इसे बदल नहीं सकते।",
      "कीबोर्ड से: एरो कुंजियाँ खानों के बीच चलती हैं। R खाने को लाल बनाता है, B नीला बनाता है और Space खाली करता है।",
      '"वापस लें" आपका पिछला बदलाव हटा देता है।',
      '"संकेत" एक ऐसा खाना दिखाता है जो नियमों से तय होता है, और उसका कारण भी। हर संकेत आपके परिणाम में गिना जाता है।',
    ],
  },
  boardLabel: "Colour Binary, {{size}} × {{size}}",
  colours: { R: "लाल", B: "नीला", empty: "खाली" },
  square: "पंक्ति {{row}}, स्तंभ {{column}}: {{colour}}",
  squareGiven: "पंक्ति {{row}}, स्तंभ {{column}}: {{colour}}, दिया गया",
  legend: {
    label: "खानों का संकेत",
    given: "दिया गया",
    yours: "आपका",
  },
  status: {
    start: "खाने को लाल बनाने के लिए टैप करें। नीले के लिए फिर टैप करें, और खाली करने के लिए एक बार और।",
    solved: "आपने पहेली हल कर ली। हर पंक्ति और हर स्तंभ नियमों का पालन करता है।",
  },
  lines: { row: "पंक्ति {{number}}", column: "स्तंभ {{number}}" },
  broken: {
    three: "{{line}} में एक साथ तीन खाने हैं जिनका रंग {{colour}} है।",
    half: "{{line}} में {{half}} से ज़्यादा खानों का रंग {{colour}} है।",
  },
  undoButton: "वापस लें",
  hintButton: "संकेत",
  hint: {
    half: "पंक्ति {{row}}, स्तंभ {{column}}: {{line}} के आधे खानों का रंग पहले से {{otherColour}} है। इसलिए इस खाने का रंग {{colour}} है।",
    three:
      "पंक्ति {{row}}, स्तंभ {{column}}: यहाँ रंग {{otherColour}} होने पर {{line}} में एक साथ तीन खानों का रंग {{otherColour}} हो जाएगा। इसलिए इस खाने का रंग {{colour}} है।",
  },
  noHint: "कोई संकेत उपलब्ध नहीं",
  score_one: "{{count}} संकेत",
  score_other: "{{count}} संकेत",
  scoreWord_one: "संकेत",
  scoreWord_other: "संकेत",
};
