const grammarPatterns = [
  {
    title:"1. Need to do something",
    yourEnglish:"What do we need to do?",
    thai:"เราต้องทำอะไรบ้างครับ",
    formula:"เรา + ต้อง + VERB + OBJECT / QUESTION",
    meaning:"we + need/must + verb + object/question",
    explanation:"Thai does not change the verb for person or tense. ต้อง goes before the action. You can keep the same frame and swap the verb or object.",
    swaps:[
      ["ทำ","do","เราต้องทำอะไรบ้างครับ","What do we need to do?"],
      ["ส่ง","send","เราต้องส่งอะไรบ้างครับ","What do we need to send?"],
      ["เตรียม","prepare","เราต้องเตรียมอะไรบ้างครับ","What do we need to prepare?"],
      ["แก้","fix/revise","เราต้องแก้อะไรบ้างครับ","What do we need to fix?"]
    ]
  },
  {
    title:"2. Can we do that?",
    yourEnglish:"Can we do that?",
    thai:"ทำแบบนั้นได้ไหมครับ",
    formula:"VERB + ... + ได้ไหม",
    meaning:"verb + ... + can? / possible?",
    explanation:"ได้ไหม at the end asks whether an action is possible or permitted. Put the action first, then ได้ไหม.",
    swaps:[
      ["ทำแบบนั้น","do it that way","ทำแบบนั้นได้ไหมครับ","Can we do it that way?"],
      ["ส่งวันนี้","send it today","ส่งวันนี้ได้ไหมครับ","Can we send it today?"],
      ["เปลี่ยนตรงนี้","change this part","เปลี่ยนตรงนี้ได้ไหมครับ","Can we change this part?"],
      ["ใช้เวอร์ชันนี้","use this version","ใช้เวอร์ชันนี้ได้ไหมครับ","Can we use this version?"]
    ]
  },
  {
    title:"3. Is it still needed?",
    yourEnglish:"Do we still need this?",
    thai:"อันนี้ยังต้องใช้อยู่ไหมครับ",
    formula:"SUBJECT + ยัง + ต้อง + VERB + อยู่ไหม",
    meaning:"subject + still + need to + verb + still?",
    explanation:"ยัง means still/yet. อยู่ marks an ongoing state. In everyday speech, you can often shorten this to ยังต้องใช้ไหมครับ.",
    swaps:[
      ["ใช้","use","อันนี้ยังต้องใช้ไหมครับ","Do we still need to use this?"],
      ["เก็บ","keep","อันนี้ยังต้องเก็บไหมครับ","Do we still need to keep this?"],
      ["ใส่","include/put","อันนี้ยังต้องใส่ไหมครับ","Do we still need to include this?"],
      ["แก้","revise","อันนี้ยังต้องแก้ไหมครับ","Do we still need to revise this?"]
    ]
  },
  {
    title:"4. Let me do X first",
    yourEnglish:"Let me check first.",
    thai:"เดี๋ยวผมเช็กก่อนครับ",
    formula:"เดี๋ยว + ผม + VERB + ก่อน",
    meaning:"in a moment / I'll + I + verb + first",
    explanation:"เดี๋ยว often introduces something you are about to do. ก่อน means first/before proceeding. This sounds more natural than translating 'let me' word for word.",
    swaps:[
      ["เช็ก","check","เดี๋ยวผมเช็กก่อนครับ","Let me check first."],
      ["ดู","look","เดี๋ยวผมดูก่อนครับ","Let me look first."],
      ["ถาม","ask","เดี๋ยวผมถามก่อนครับ","Let me ask first."],
      ["คุยกับนุ่น","talk to Noon","เดี๋ยวผมคุยกับนุ่นก่อนครับ","Let me talk to Noon first."]
    ]
  },
  {
    title:"5. Ask someone to do something",
    yourEnglish:"Check this for me.",
    thai:"ช่วยเช็กอันนี้ให้ผมหน่อยครับ",
    formula:"ช่วย + VERB + OBJECT + ให้ผม + หน่อย",
    meaning:"please help + verb + object + for me + a bit",
    explanation:"ช่วย and หน่อย soften a direct instruction. ให้ผม means for me. This is one of the most useful Thai request frames for work.",
    swaps:[
      ["เช็กอันนี้","check this","ช่วยเช็กอันนี้ให้ผมหน่อยครับ","Check this for me."],
      ["ตามเรื่องนี้","follow this up","ช่วยตามเรื่องนี้ให้ผมหน่อยครับ","Follow this up for me."],
      ["ส่งไฟล์นี้","send this file","ช่วยส่งไฟล์นี้ให้ผมหน่อยครับ","Send this file to me."],
      ["สรุปเรื่องนี้","summarize this","ช่วยสรุปเรื่องนี้ให้ผมหน่อยครับ","Summarize this for me."]
    ]
  },
  {
    title:"6. Ask what / where / how",
    yourEnglish:"How do we resolve this?",
    thai:"เรื่องนี้แก้ยังไงครับ",
    formula:"TOPIC + VERB + QUESTION WORD",
    meaning:"topic + action + how/where/what",
    explanation:"Thai often puts the question word where the missing information belongs. It does not need to move to the front as in English.",
    swaps:[
      ["เรื่องนี้แก้ยังไง","this issue fix how","เรื่องนี้แก้ยังไงครับ","How do we resolve this?"],
      ["ไฟล์นี้อยู่ไหน","this file is where","ไฟล์นี้อยู่ไหนครับ","Where is this file?"],
      ["อันนี้คืออะไร","this is what","อันนี้คืออะไรครับ","What is this?"],
      ["เราส่งเมื่อไหร่","we send when","เราส่งเมื่อไหร่ครับ","When do we send it?"]
    ]
  },
  {
    title:"7. Say something does not match",
    yourEnglish:"That doesn't match.",
    thai:"อันนี้ไม่ตรงครับ",
    formula:"SUBJECT + ไม่ + VERB / ADJECTIVE",
    meaning:"subject + not + verb/adjective",
    explanation:"ไม่ goes directly before what you are negating. Thai verbs and adjectives do not need 'do/does' or 'is/are' in the same way English does.",
    swaps:[
      ["ตรง","match","อันนี้ไม่ตรงครับ","This doesn't match."],
      ["ถูก","correct","อันนี้ไม่ถูกครับ","This isn't correct."],
      ["พอ","enough","อันนี้ไม่พอครับ","This isn't enough."],
      ["ชัด","clear","อันนี้ไม่ชัดครับ","This isn't clear."]
    ]
  },
  {
    title:"8. Propose an option",
    yourEnglish:"Should we say 30,000 to 45,000?",
    thai:"ใส่สามหมื่นถึงสี่หมื่นห้าดีไหมครับ",
    formula:"ACTION / OPTION + ดีไหม",
    meaning:"action/option + good?",
    explanation:"ดีไหม is a very natural way to propose an option: 'Would X be good?' It often corresponds to English 'should we...?'",
    swaps:[
      ["ใส่สามหมื่นถึงสี่หมื่นห้า","put 30,000-45,000","ใส่สามหมื่นถึงสี่หมื่นห้าดีไหมครับ","Should we put 30,000-45,000?"],
      ["ส่งวันนี้","send today","ส่งวันนี้ดีไหมครับ","Should we send it today?"],
      ["เริ่มตรงนี้","start here","เริ่มตรงนี้ดีไหมครับ","Should we start here?"],
      ["ใช้เวอร์ชันนี้","use this version","ใช้เวอร์ชันนี้ดีไหมครับ","Should we use this version?"]
    ]
  }
];

const coreWords = [
  ["เรา","rao","we / us"],
  ["ผม","phǒm","I / me - male"],
  ["ต้อง","dtâwng","must / need to"],
  ["ทำ","tham","do / make"],
  ["แก้","kɛ̂ɛ","fix / revise"],
  ["เช็ก","chék","check"],
  ["ส่ง","sòng","send"],
  ["ใช้","chái","use"],
  ["ใส่","sài","put / include"],
  ["ดู","duu","look / see"],
  ["ถาม","thǎam","ask"],
  ["ให้","hâi","give / for / cause"],
  ["ยัง","yang","still / yet"],
  ["ไม่","mâi","not"],
  ["ได้","dâi","can / get / possible"],
  ["ไหม","mái","yes-no question particle"],
  ["อะไร","à-rai","what"],
  ["ยังไง","yang-ngai","how"],
  ["ไหน","nǎi","which / where"],
  ["ก่อน","gɔ̀ɔn","first / before"],
  ["หน่อย","nɔ̀i","a little - softener"],
  ["บ้าง","bâang","some / which things"],
  ["ดีไหม","dii mái","would that be good? / should we?"]
];