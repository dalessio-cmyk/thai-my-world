const vocabSets = {
  cooking: {
    name:"Cooking & kitchen",
    words:[
      ["ปลา","bplaa","fish"],["ปลาแบล็กคอด","bplaa blɛ́k-khɔ̀ɔt","black cod"],["ปลาทั้งตัว","bplaa tháng dtua","whole fish"],
      ["เกลือ","glʉa","salt"],["ไข่แดง","khài dɛɛng","egg yolk"],["ไข่ขาว","khài khǎao","egg white"],
      ["เนย","nəəi","butter"],["เลมอน","lee-mɔɔn","lemon"],["ผิวเลมอน","phǐw lee-mɔɔn","lemon zest"],
      ["แตงกวา","dtɛɛng-gwaa","cucumber"],["เฟนเนล","fen-neen","fennel"],["ผักชีลาว","phàk-chii-laao","dill"],
      ["เกล็ดขนมปัง","glèt khà-nǒm-bpang","breadcrumbs"],["ซาวร์โดว์","sao-doo","sourdough"],
      ["ซอส","sɔ́ɔt","sauce"],["น้ำสลัด","náam-sà-làt","dressing"],["กระทะ","grà-thá","pan"],
      ["เตาอบ","dtao òp","oven"],["อบ","òp","bake / roast"],["ทอด","thɔ̂ɔt","fry"],
      ["ต้ม","dtôm","boil"],["ย่าง","yâang","grill"],["สุก","sùk","cooked"],["ดิบ","dìp","raw"],
      ["กรอบ","grɔ̀ɔp","crispy"],["อุณหภูมิ","un-hà-phuum","temperature"],["ไฟอ่อน","fai ɔ̀ɔn","low heat"],
      ["ไฟกลาง","fai glaang","medium heat"],["ไฟแรง","fai rɛɛng","high heat"],["ชั่ง","châng","weigh"],
      ["กรัม","gram","gram"],["ก่อนปรุง","gɔ̀ɔn bprung","before cooking"],["หลังปรุง","lǎng bprung","after cooking"],
      ["ของเหลือ","khɔ̌ɔng lʉ̌a","leftovers"],["แช่ตู้เย็น","chɛ̂ɛ dtûu-yen","refrigerate"],["อุ่น","ùn","reheat / warm"],
      ["โปรตีน","bproo-dtiin","protein"],["รสชาติ","rót-châat","flavor"],["ชิม","chim","taste"]
    ],
    phrases:[
      ["อันนี้สุกหรือยังครับ","an níi sùk rʉ̌ʉ yang khráp","Is this cooked yet?"],
      ["ใช้ไฟกลางก่อนครับ","chái fai glaang gɔ̀ɔn khráp","Use medium heat first."],
      ["ต้องอบอีกกี่นาทีครับ","dtâwng òp ìik gìi naa-thii khráp","How many more minutes does it need to bake?"],
      ["ชั่งตอนดิบหรือตอนสุกครับ","châng dton dìp rʉ̌ʉ dton sùk khráp","Do I weigh it raw or cooked?"],
      ["ของที่เหลือเก็บยังไงครับ","khɔ̌ɔng thîi lʉ̌a gèp yang-ngai khráp","How should I store the leftovers?"]
    ]
  },
  shopping:{
    name:"Shopping, size & fit",
    words:[
      ["ไซซ์","sái","size"],["เบอร์รองเท้า","bəə rong-tháao","shoe size"],["ความยาวเท้า","khwaam-yaao tháao","foot length"],
      ["ความกว้าง","khwaam-gwâang","width"],["รอบหน้าเท้า","rɔ̂ɔp nâa tháao","foot girth / forefoot circumference"],
      ["พอดี","phɔɔ-dii","fits / just right"],["คับไป","kháp pai","too tight / too small"],["หลวมไป","lǔam pai","too loose / too big"],
      ["ตรงไซซ์","dtrong sái","true to size"],["ครึ่งไซซ์","khrʉ̂ng sái","half size"],["วัดขนาด","wát khà-nàat","measure size"],
      ["เซนติเมตร","sen-dtì-meet","centimeter"],["นิ้ว","níw","inch"],["สี","sǐi","color"],["สีดำ","sǐi dam","black"],
      ["สีเบจ","sǐi bèet","beige"],["สีน้ำตาล","sǐi náam-dtaan","brown"],["ราคา","raa-khaa","price"],["ลดราคา","lót raa-khaa","on sale / discounted"],
      ["มีของ","mii khɔ̌ɔng","in stock"],["ของหมด","khɔ̌ɔng mòt","out of stock"],["สั่งซื้อ","sàng sʉ́ʉ","order / purchase"],
      ["คืนสินค้า","khʉʉn sǐn-kháa","return an item"],["เปลี่ยนสินค้า","bplìan sǐn-kháa","exchange an item"],
      ["หัวแหลม","hǔa lɛ̌ɛm","pointed toe"],["หัวเหลี่ยม","hǔa lìam","square toe"],["หัวมน","hǔa mon","round toe"],["หัวเปิด","hǔa bpə̀ət","open toe"]
    ],
    phrases:[
      ["ไซซ์นี้คับไปนิดหนึ่งครับ","sái níi kháp pai nít nʉ̀ng khráp","This size is a little too tight."],
      ["รุ่นนี้ตรงไซซ์ไหมครับ","rûn níi dtrong sái mái khráp","Is this model true to size?"],
      ["มีครึ่งไซซ์ไหมครับ","mii khrʉ̂ng sái mái khráp","Do you have a half size?"],
      ["ขอลองสีนี้ครับ","khɔ̌ɔ lawng sǐi níi khráp","I'd like to try this color."],
      ["ถ้าไม่พอดีคืนได้ไหมครับ","thâa mâi phɔɔ-dii khʉʉn dâi mái khráp","If it doesn't fit, can I return it?"]
    ]
  },
  filmmaking:{
    name:"Filmmaking & directing",
    words:[
      ["กองถ่าย","gɔɔng thàai","film set"],["ถ่ายทำ","thàai-tham","shoot / film"],["กล้อง","glâwng","camera"],["เลนส์","leen","lens"],
      ["ช็อต","chót","shot"],["เทค","thêek","take"],["ฉาก","chàak","scene"],["นักแสดง","nák-sà-dɛɛng","actor"],
      ["การแสดง","gaan-sà-dɛɛng","performance"],["มอนิเตอร์","mɔɔ-ní-dtəə","monitor"],["เพลย์แบ็ก","phlee-bɛ̀k","playback"],
      ["เฟรม","freem","frame"],["โคลสอัพ","khlôot-áp","close-up"],["ไวด์ช็อต","wái chót","wide shot"],
      ["แสง","sɛ̌ɛng","light"],["คีย์ไลต์","khii-lái","key light"],["สตอรี่บอร์ด","sà-dtɔɔ-rîi-bɔ̀ɔt","storyboard"],
      ["ทรีตเมนต์","thrîit-men","treatment"],["ตารางถ่าย","dtaa-raang thàai","shoot schedule"],["เวลานัดกอง","wee-laa nát gɔɔng","call time"],
      ["โลเคชัน","loo-khee-chân","location"],["สตูดิโอ","sà-dtuu-dii-oo","studio"],["วิชวลเอฟเฟกต์","wí-chuan ef-fèk","visual effects"],
      ["เรนเดอร์","reen-dəə","render"],["คอมโพสิต","khɔɔm-phoo-sìt","composite"],["ตัดต่อ","dtàt-dtɔ̀ɔ","edit"],
      ["คัต","khát","cut"],["เสียง","sǐang","sound"],["เวอร์ชัน","wəə-chân","version"],["ลูกค้า","lûuk-kháa","client"],
      ["แก้","kɛ̂ɛ","revise / fix"],["ผ่าน","phàan","approved / passed"],["เดดไลน์","dèt-lai","deadline"],["ไฟล์","fai","file"]
    ],
    phrases:[
      ["ขออีกเทคครับ","khɔ̌ɔ ìik thêek khráp","One more take, please."],
      ["ลองช้าลงนิดหนึ่งครับ","lawng cháa long nít nʉ̀ng khráp","Try it a little slower."],
      ["ขอดูเพลย์แบ็กก่อนครับ","khɔ̌ɔ duu phlee-bɛ̀k gɔ̀ɔn khráp","Let me see playback first."],
      ["ช็อตนี้ยังไม่ผ่านครับ","chót níi yang mâi phàan khráp","This shot is not approved yet."],
      ["ส่งเวอร์ชันล่าสุดให้ผมด้วยครับ","sòng wəə-chân lâa-sùt hâi phǒm dûai khráp","Send me the latest version."]
    ]
  },
  business:{
    name:"Business & team",
    words:[
      ["งบประมาณ","ngóp bprà-maan","budget"],["เดดไลน์","dèt-lai","deadline"],["ประชุม","bprà-chum","meeting"],["สรุป","sà-rùp","summary"],
      ["ด่วน","dùan","urgent"],["รับผิดชอบ","ráp-phìt-chɔ̂ɔp","responsible"],["ติดขัด","dtìt-khàt","blocked / stuck"],
      ["ตามเรื่อง","dtaam rʉ̂ang","follow up"],["อนุมัติ","à-nú-mát","approve"],["แผน","phɛ̌ɛn","plan"],["รายละเอียด","raai-la-ìat","details"],
      ["ขั้นต่อไป","khân dtɔ̀ɔ-pai","next step"],["ลูกค้า","lûuk-kháa","client"],["ทีม","thiim","team"]
    ],
    phrases:[
      ["ตอนนี้ติดตรงไหนครับ","dton-níi dtìt dtrong-nǎi khráp","What's blocking this?"],
      ["ขอสรุปสั้นๆ ครับ","khɔ̌ɔ sà-rùp sân-sân khráp","Give me a short summary."],
      ["ใครรับผิดชอบเรื่องนี้ครับ","khrai ráp-phìt-chɔ̂ɔp rʉ̂ang níi khráp","Who owns this?"],
      ["เราต้องได้อันนี้ภายในวันศุกร์ครับ","rao dtâwng dâi an níi phaai-nai wan-sùk khráp","We need this by Friday."],
      ["เอาแบบง่ายๆ ครับ","ao bɛ̀ɛp ngâai-ngâai khráp","Let's keep it simple."]
    ]
  },
  accounting:{
    name:"Accounting & admin",
    words:[
      ["ใบแจ้งหนี้","bai jɛ̂ɛng nîi","invoice"],["ใบกำกับภาษี","bai gam-gàp phaa-sǐi","tax invoice"],["ภาษีมูลค่าเพิ่ม","phaa-sǐi muun-khâa phə̂əm","VAT"],
      ["หัก ณ ที่จ่าย","hàk na thîi jàai","withholding tax"],["ใบเสร็จ","bai sèt","receipt"],["โอนเงิน","oon ngoen","transfer money"],
      ["สลิป","sà-líp","transfer slip"],["ยอด","yɔ̂ɔt","amount / total"],["เงินเดือน","ngoen-dʉan","salary"],["ลางานไม่รับค่าจ้าง","laa-ngaan mâi ráp khâa-jâang","unpaid leave"],
      ["รายการค่าใช้จ่าย","raai-gaan khâa-chái-jàai","expense description / expense item"],["เอกสาร","èek-gà-sǎan","document"]
    ],
    phrases:[
      ["ยอดนี้รวม VAT แล้วหรือยังครับ","yɔ̂ɔt níi ruam vee-ae-thii lɛ́ɛo rʉ̌ʉ yang khráp","Does this total include VAT?"],
      ["หัก ณ ที่จ่ายกี่เปอร์เซ็นต์ครับ","hàk na thîi jàai gìi pəə-sen khráp","What percentage is the withholding tax?"],
      ["อันนี้ใครเป็นคนจ่ายครับ","an níi khrai bpen khon jàai khráp","Who paid for this?"],
      ["รายการค่าใช้จ่ายนี้ควรเขียนว่าอะไรครับ","raai-gaan khâa-chái-jàai níi khuan khǐan wâa à-rai khráp","What should the expense description say?"]
    ]
  },
  repairs:{
    name:"Repairs & contractors",
    words:[
      ["ท่อ","thɔ̂ɔ","pipe"],["วาล์ว","waan","valve"],["ก๊อก","gɔ́k","faucet"],["รั่ว","rûa","leak"],["ซึม","sʉm","seep / small leak"],
      ["สะดืออ่าง","sà-dʉʉ àang","sink drain"],["เชื่อมท่อ","chʉ̂am thɔ̂ɔ","weld/join pipe"],["ซ่อม","sɔ̂m","repair"],["เปลี่ยน","bplìan","replace / change"],
      ["ช่าง","châang","technician / tradesperson"],["ค่าแรง","khâa-rɛɛng","labor charge"],["อะไหล่","à-lài","spare part"],["หน้างาน","nâa-ngaan","job site"]
    ],
    phrases:[
      ["ตรงนี้ยังรั่วอยู่ครับ","dtrong níi yang rûa yùu khráp","It's still leaking here."],
      ["ต้องเปลี่ยนวาล์วไหมครับ","dtâwng bplìan waan mái khráp","Does the valve need replacing?"],
      ["ซ่อมได้ไหม หรือควรเปลี่ยนครับ","sɔ̂m dâi mái rʉ̌ʉ khuan bplìan khráp","Can it be repaired or should we replace it?"],
      ["ค่าแรงเท่าไหร่ครับ","khâa-rɛɛng thâo-rài khráp","How much is the labor?"]
    ]
  },
  travel:{
    name:"Travel & flights",
    words:[
      ["เที่ยวบิน","thîao-bin","flight"],["ต่อเครื่อง","dtɔ̀ɔ khrʉ̂ang","connect / layover"],["สนามบิน","sà-nǎam-bin","airport"],
      ["กระเป๋าโหลด","grà-pǎo lòot","checked bag"],["น้ำหนักกระเป๋า","náam-nàk grà-pǎo","baggage weight"],["ชั้นธุรกิจ","chán thú-rá-gìt","business class"],
      ["ที่นั่ง","thîi-nâng","seat"],["ริมทางเดิน","rim thaang-dəən","aisle"],["วันที่ยืดหยุ่น","wan-thîi yʉ̂ʉt-yùn","flexible dates"],
      ["วีซ่า","wii-sâa","visa"],["แผนการเดินทาง","phɛ̌ɛn gaan-dəən-thaang","itinerary"],["ดีเลย์","dii-lêe","delay"]
    ],
    phrases:[
      ["ต่อเครื่องที่ไหนครับ","dtɔ̀ɔ khrʉ̂ang thîi-nǎi khráp","Where is the layover?"],
      ["โหลดกระเป๋าได้กี่กิโลครับ","lòot grà-pǎo dâi gìi gì-loo khráp","How many kilos can I check?"],
      ["มีวันที่ถูกกว่านี้ไหมครับ","mii wan-thîi thùuk gwàa níi mái khráp","Are there cheaper dates?"],
      ["ขอที่นั่งริมทางเดินครับ","khɔ̌ɔ thîi-nâng rim thaang-dəən khráp","An aisle seat, please."]
    ]
  },
  noon:{
    name:"Noon & home",
    words:[
      ["สวย","sǔai","beautiful"],["น่ารัก","nâa-rák","cute / lovely"],["รัก","rák","love"],["คิดถึง","khít-thʉ̌ng","miss / think of"],
      ["สบายใจ","sà-baai-jai","feel at ease"],["เหนื่อย","nʉ̀ai","tired"],["ดูแล","duu-lɛɛ","take care of"],["ยิ้ม","yím","smile"],
      ["บ้าน","bâan","home"],["ขอบคุณ","khɔ̀ɔp-khun","thank you"],["เลือก","lʉ̂ak","choose"],["อยู่ข้างๆ","yùu khâang-khâang","be by someone's side"]
    ],
    phrases:[
      ["นุ่น วันนี้สวยมากเลย","Nûn wan-níi sǔai mâak loei","Noon, you look very beautiful today."],
      ["อยู่กับนุ่นแล้วผมสบายใจ","yùu kàp Nûn lɛ́ɛo phǒm sà-baai-jai","I feel at peace when I'm with you."],
      ["วันนี้เหนื่อยไหม เดี๋ยวผมดูแลเอง","wan-níi nʉ̀ai mái dǐao phǒm duu-lɛɛ eeng","Are you tired? I'll take care of things."],
      ["ผมโชคดีที่มีนุ่น","phǒm chôok-dii thîi mii Nûn","I'm lucky to have you."]
    ]
  }
};