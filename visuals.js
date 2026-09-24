function makeVisualCardImage(emoji,label,sub=""){
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" role="img" aria-label="${esc(label)}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f8f4ea"/>
        <stop offset="100%" stop-color="#e9eef5"/>
      </linearGradient>
    </defs>
    <rect width="900" height="520" rx="44" fill="url(#bg)"/>
    <circle cx="450" cy="215" r="142" fill="#ffffff" opacity=".88"/>
    <text x="450" y="285" text-anchor="middle" font-size="176" font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif">${esc(emoji)}</text>
    <text x="450" y="420" text-anchor="middle" font-size="42" font-weight="750" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif" fill="#111827">${esc(label)}</text>
    ${sub?`<text x="450" y="463" text-anchor="middle" font-size="24" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif" fill="#667085">${esc(sub)}</text>`:""}
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
}

const visualFlashcards = [
  {id:"raw",category:"cooking",en:"raw",th:"ดิบ",phon:"dìp",note:"Food before cooking.",alt:"Raw food",image:makeVisualCardImage("🥩","RAW","ดิบ")},
  {id:"cooked",category:"cooking",en:"cooked",th:"สุก",phon:"sùk",note:"Food that is cooked.",alt:"Cooked food",image:makeVisualCardImage("🍳","COOKED","สุก")},
  {id:"weigh",category:"cooking",en:"weigh",th:"ชั่ง",phon:"châng",note:"Useful for protein and recipe measurements.",alt:"Kitchen scale",image:makeVisualCardImage("⚖️","WEIGH","ชั่ง")},
  {id:"raw-or-cooked",category:"cooking",en:"Do I weigh it raw or cooked?",th:"ชั่งตอนดิบหรือตอนสุกครับ",phon:"châng dton dìp rʉ̌ʉ dton sùk khráp",note:"A phrase you use when tracking food.",alt:"Weigh raw or cooked food",image:makeVisualCardImage("⚖️🥩","RAW OR COOKED?","ชั่งตอนดิบหรือตอนสุก")},
  {id:"fit",category:"shopping",en:"fits / just right",th:"พอดี",phon:"phɔɔ-dii",note:"For shoes, clothes, measurements, or quantity.",alt:"Shoe fits",image:makeVisualCardImage("👟","FITS","พอดี")},
  {id:"size",category:"shopping",en:"size / measurement",th:"ขนาด",phon:"khà-nàat",note:"General size or dimensions.",alt:"Ruler measuring size",image:makeVisualCardImage("📏","SIZE","ขนาด")},
  {id:"return",category:"shopping",en:"return an item",th:"คืนสินค้า",phon:"khʉʉn sǐn-kháa",note:"Use คืน by itself when the item is already obvious.",alt:"Return package",image:makeVisualCardImage("📦↩️","RETURN","คืนสินค้า")},
  {id:"this-one",category:"shopping",en:"I want / I'll take this one",th:"เอาอันนี้",phon:"ao an-níi",note:"Very natural for quick shopping decisions.",alt:"Pointing to this item",image:makeVisualCardImage("👉","THIS ONE","เอาอันนี้")},
  {id:"size-fit",category:"shopping",en:"Does this size fit?",th:"ไซซ์นี้พอดีไหม",phon:"sái níi phɔɔ-dii mái",note:"Short and natural in a shop.",alt:"Checking shoe fit",image:makeVisualCardImage("👟✅","DOES IT FIT?","ไซซ์นี้พอดีไหม")},
  {id:"reduce-sugar",category:"cooking",en:"Can I reduce the sugar?",th:"ลดน้ำตาลได้ไหม",phon:"lót náam-dtaan dâi mái",note:"Verb + ได้ไหม = can I / is it possible to...?",alt:"Reduce sugar",image:makeVisualCardImage("🍬⬇️","LESS SUGAR?","ลดน้ำตาลได้ไหม")}
];

function visualCardsForFocus(focus){
  if(!focus||!focus.length)return visualFlashcards;
  const allowed=new Set(focus);
  return visualFlashcards.filter(c=>allowed.has(c.category));
}

function visualForMeaning(meaning){
  const m=String(meaning||"").toLowerCase();
  return visualFlashcards.find(c=>m===c.en.toLowerCase()||m.includes(c.en.toLowerCase())||c.en.toLowerCase().includes(m));
}
