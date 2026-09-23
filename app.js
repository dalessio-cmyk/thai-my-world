const schedule=["production","management","vendor","vfx","partners","finance","social","travel","restaurant","production","social","management","vfx","social"];
const launch=new Date("2026-09-23T00:00:00");
const now=new Date();
const dayIndex=Math.max(0,Math.floor((new Date(now.getFullYear(),now.getMonth(),now.getDate())-launch)/86400000));
const key=schedule[dayIndex%schedule.length];
const lesson=modules[key];
const scores=JSON.parse(localStorage.getItem("thaiWorldScores")||"{}");
let custom=JSON.parse(localStorage.getItem("thaiWorldCustom")||"[]");
let dailyStats=JSON.parse(localStorage.getItem("thaiWorldDailyStats")||"{}");

function todayKey(){return new Date().toISOString().slice(0,10)}
function pid(mod,idx){return mod+"-"+idx}
function speak(text){
  if(!("speechSynthesis" in window)){alert("Thai speech is not available in this browser.");return}
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text); u.lang="th-TH"; u.rate=.76;
  const voices=speechSynthesis.getVoices(); const thai=voices.find(v=>(v.lang||"").toLowerCase().startsWith("th"));
  if(thai)u.voice=thai; speechSynthesis.speak(u);
}
function ensureDay(){
  const k=todayKey();
  if(!dailyStats[k])dailyStats[k]={speaking:{right:0,total:0},reading:{right:0,total:0},vocabulary:{right:0,total:0},grammar:{right:0,total:0}};
  return dailyStats[k];
}
function record(category,correct){
  const d=ensureDay(); if(!d[category])d[category]={right:0,total:0};
  d[category].total++; if(correct)d[category].right++;
  localStorage.setItem("thaiWorldDailyStats",JSON.stringify(dailyStats));
  renderGrades(); renderStreak();
}
function mark(id,val,category="speaking"){
  scores[id]=val; localStorage.setItem("thaiWorldScores",JSON.stringify(scores)); record(category,val===2); renderToday();
}
function phraseCard(p,id,category="speaking"){
  const s=scores[id]||0;
  return `<div class="card">
    <div class="thai">${p[0]}</div><div class="phon">${p[1]||""}</div>
    <div class="eng">${p[2]}</div><div class="note">${p[3]||""}</div>
    <div class="actions">
      <button onclick='speak(${JSON.stringify(p[0])})'>Hear it</button>
      <button class="${s===2?"good":""}" onclick='mark(${JSON.stringify(id)},2,${JSON.stringify(category)})'>Know it</button>
      <button class="${s===1?"warn":""}" onclick='mark(${JSON.stringify(id)},1,${JSON.stringify(category)})'>Need practice</button>
    </div></div>`;
}
function selectToday(){
  const arr=lesson.phrases; let picked=[];
  const weak=arr.map((p,i)=>[p,i]).filter(x=>scores[pid(key,x[1])]===1); picked.push(...weak.slice(0,2));
  let start=(dayIndex*3)%arr.length;
  for(let j=0;picked.length<5&&j<arr.length*2;j++){let i=(start+j)%arr.length;if(!picked.some(x=>x[1]===i))picked.push([arr[i],i])}
  return picked.slice(0,5);
}
function renderToday(){
  const d=new Date();
  document.getElementById("todayDate").textContent=d.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
  document.getElementById("lessonTitle").textContent=lesson.name;
  document.getElementById("lessonGoal").textContent=lesson.goal;
  const picked=selectToday();
  document.getElementById("todayPhrases").innerHTML=picked.map(x=>phraseCard(x[0],pid(key,x[1]))).join("");
  document.getElementById("focusPattern").textContent=lesson.pattern;
  document.getElementById("focusNote").textContent=lesson.focus;
  document.getElementById("scenarioPrompt").textContent=lesson.scenario;
  document.getElementById("scenarioAnswer").innerHTML=`<div class="thai">${lesson.answer}</div><div class="actions"><button onclick='speak(${JSON.stringify(lesson.answer)})'>Hear it</button><button onclick="record('grammar',true)">I built it</button><button onclick="record('grammar',false)">Need help</button></div>`;
  const done=picked.filter(x=>scores[pid(key,x[1])]===2).length;
  document.getElementById("progressBar").style.width=(done/5*100)+"%";
  document.getElementById("progressText").textContent=`${done} of 5 phrases marked known today`;
  const n=noonPhrases[dayIndex%noonPhrases.length];
  document.getElementById("dailyNoonThai").textContent=n[0]; document.getElementById("dailyNoonPhon").textContent=n[1];
  document.getElementById("dailyNoonEng").textContent=n[2]; document.getElementById("dailyNoonNote").textContent=n[3];
  document.getElementById("dailyNoonSpeak").onclick=()=>speak(n[0]);
}
function renderModules(){
  document.getElementById("moduleList").innerHTML=Object.entries(modules).map(([k,m])=>`<button class="module-btn" onclick="openModule('${k}')"><strong>${m.name}</strong><span>${m.desc}</span></button>`).join("");
}
function openModule(k){
  const m=modules[k];
  document.getElementById("moduleDetail").innerHTML=`<div class="hero"><div class="eyebrow">${m.name}</div><h2>${m.goal}</h2><p>${m.focus}</p></div><div class="grid">${m.phrases.map((p,i)=>phraseCard(p,pid(k,i))).join("")}</div>`;
  document.getElementById("moduleDetail").scrollIntoView({behavior:"smooth"});
}
function allPractice(){
  let items=[]; Object.entries(modules).forEach(([k,m])=>m.phrases.forEach((p,i)=>items.push({p,id:pid(k,i),score:scores[pid(k,i)]||0})));
  custom.forEach((c,i)=>items.push({p:[c.thai,c.phon,c.eng,"Your saved phrase."],id:"custom-"+i,score:scores["custom-"+i]||0}));
  const weak=items.filter(x=>x.score===1),unseen=items.filter(x=>x.score===0),pool=weak.length?weak:unseen.length?unseen:items;
  return pool[Math.floor(Math.random()*pool.length)];
}
function newQuiz(){
  const q=allPractice(); if(!q){document.getElementById("quizCard").innerHTML="Add some phrases first.";return}
  document.getElementById("quizCard").innerHTML=`<div class="label">Say this in Thai</div><div class="bigline">${q.p[2]}</div>
  <div class="actions"><button onclick="document.getElementById('qa').classList.add('show')">Reveal</button></div>
  <div id="qa" class="quiz-answer"><div class="thai">${q.p[0]}</div><div class="phon">${q.p[1]}</div>
  <div class="actions"><button onclick='speak(${JSON.stringify(q.p[0])})'>Hear it</button>
  <button onclick='mark(${JSON.stringify(q.id)},2,"speaking");newQuiz()'>Got it</button>
  <button onclick='mark(${JSON.stringify(q.id)},1,"speaking");newQuiz()'>Again later</button></div></div>`;
}
let flashIndex=0;
function renderFlashcard(){
  if(!voicePhrases.length)return;
  const p=voicePhrases[flashIndex%voicePhrases.length];
  document.getElementById("flashCard").innerHTML=`<div class="label">You say this in English</div><div class="bigline">${p.en}</div>
  <div class="actions"><button onclick="document.getElementById('flashAnswer').classList.add('show')">Show Thai</button></div>
  <div class="quiz-answer" id="flashAnswer"><div class="thai">${p.th}</div><div class="phon">${p.phon}</div><div class="note">${p.note}</div>
  <div class="actions"><button onclick='speak(${JSON.stringify(p.th)})'>Hear it</button>
  <button onclick="record('speaking',true);nextFlash()">Got it</button><button onclick="record('speaking',false);nextFlash()">Need it again</button></div></div>`;
}
function nextFlash(){flashIndex=(flashIndex+1)%voicePhrases.length;renderFlashcard()}
function renderReading(){
  const letters=thaiLetters.map((l,i)=>`<div class="card"><div class="label">Consonant · ${l[3]} class</div><div class="thai letter">${l[0]}</div><div class="bigline">${l[1]}</div><div class="phon">${l[2]}</div><div class="eng">Example: ${l[4]} · ${l[5]}</div><div class="actions"><button onclick='speak(${JSON.stringify(l[4])})'>Hear word</button><button onclick="record('reading',true)">Recognize</button><button onclick="record('reading',false)">Again</button></div></div>`).join("");
  const vowels=thaiVowels.map(v=>`<div class="card"><div class="label">Vowel</div><div class="thai">${v[0]}</div><div class="phon">${v[1]} · ${v[2]}</div><div class="eng">${v[3]} = ${v[4]}</div><div class="actions"><button onclick='speak(${JSON.stringify(v[3])})'>Hear it</button></div></div>`).join("");
  const drills=readingDrills.map(r=>`<div class="card"><div class="label">${r.label}</div><div class="thai">${r.thai}</div><div class="phon">${r.chunks}</div><div class="eng">${r.meaning}</div><div class="note">${r.note}</div><div class="actions"><button onclick='speak(${JSON.stringify(r.thai)})'>Hear it</button><button onclick="record('reading',true)">I read it</button><button onclick="record('reading',false)">Need work</button></div></div>`).join("");
  document.getElementById("readingHome").innerHTML=`<div class="card"><h3>Reading order</h3><div class="eng">1. Recognize consonants in useful words. 2. Learn vowel shapes. 3. Read chunks. 4. Read phrases you already say. Tone rules come after letter-class recognition is stable.</div></div>
  <h3 style="margin:18px 2px 8px">Read phrases first</h3><div class="grid">${drills}</div>
  <h3 style="margin:18px 2px 8px">Vowels</h3><div class="grid two">${vowels}</div>
  <h3 style="margin:18px 2px 8px">Consonants</h3><div class="grid two">${letters}</div>`;
}
function renderGrammar(){
  document.getElementById("grammarHome").innerHTML=grammarPatterns.map(g=>`<div class="card" style="margin-bottom:12px"><div class="label">${g.title}</div><div class="eng">Your phrase: <strong>${g.yourEnglish}</strong></div><div class="thai">${g.thai}</div><div class="bigline">${g.formula}</div><div class="note">${g.explanation}</div>
  <div style="margin-top:12px">${g.swaps.map(s=>`<div class="step"><div class="num">↔</div><div><strong>${s[0]}</strong> = ${s[1]}<br><span class="thai-mini">${s[2]}</span><br><span class="tiny">${s[3]}</span></div></div>`).join("")}</div>
  <div class="actions"><button onclick="record('grammar',true)">I can use this pattern</button><button onclick="record('grammar',false)">Recycle tomorrow</button></div></div>`).join("")+
  `<div class="card"><h3>Core words that build your sentences</h3><div class="word-grid">${coreWords.map(w=>`<button class="wordchip" onclick='speak(${JSON.stringify(w[0])})'><strong>${w[0]}</strong><span>${w[1]}</span><small>${w[2]}</small></button>`).join("")}</div></div>`;
}
function openVocabSet(k){
  const s=vocabSets[k];
  document.getElementById("vocabDetail").innerHTML=`<div class="hero"><div class="eyebrow">Vocabulary set</div><h2>${s.name}</h2><p>Learn the word, hear it, then use it in one of your sentence patterns.</p></div>
  <div class="grid two">${s.words.map((w,i)=>`<div class="card"><div class="thai">${w[0]}</div><div class="phon">${w[1]}</div><div class="eng">${w[2]}</div><div class="actions"><button onclick='speak(${JSON.stringify(w[0])})'>Hear</button><button onclick="record('vocabulary',true)">Know</button><button onclick="record('vocabulary',false)">Again</button></div></div>`).join("")}</div>
  <h3 style="margin:18px 2px 8px">Use the words</h3><div class="grid">${s.phrases.map((p,i)=>phraseCard([p[0],p[1],p[2],"Built from this vocabulary set."],"vocab-"+k+"-"+i,"vocabulary")).join("")}</div>`;
  document.getElementById("vocabDetail").scrollIntoView({behavior:"smooth"});
}
function renderVocab(){
  document.getElementById("vocabHome").innerHTML=`<div class="module-list">${Object.entries(vocabSets).map(([k,s])=>`<button class="module-btn" onclick="openVocabSet('${k}')"><strong>${s.name}</strong><span>${s.words.length} words + useful sentences</span></button>`).join("")}</div><div id="vocabDetail" style="margin-top:12px"></div>`;
}
function pct(x){return !x||!x.total?null:Math.round(x.right/x.total*100)}
function letterGrade(n){if(n===null)return"—";if(n>=93)return"A";if(n>=85)return"B";if(n>=75)return"C";if(n>=65)return"D";return"Needs work"}
function scoreDay(d){
  if(!d)return null; const vals=["speaking","reading","vocabulary","grammar"].map(k=>pct(d[k])).filter(x=>x!==null);
  return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):null;
}
function renderGrades(){
  const d=dailyStats[todayKey()]||{}; const total=scoreDay(d);
  const cats=[["Speaking","speaking"],["Reading","reading"],["Vocabulary","vocabulary"],["Sentence building","grammar"]];
  const hist=Object.keys(dailyStats).sort().reverse().slice(0,7);
  const grade=document.getElementById("gradeHome"); if(!grade)return;
  grade.innerHTML=`<div class="grade-card"><div class="label">Today</div><div class="grade-big">${letterGrade(total)}</div><div class="bigline">${total===null?"Start today's lesson":total+"%"}</div><div class="note">Grades reflect your answers in this app. A weak score is a recycling signal, not a permanent level.</div></div>
  <div class="grid two" style="margin-top:12px">${cats.map(([n,k])=>{const p=pct(d[k]);return`<div class="card"><div class="label">${n}</div><div class="bigline">${p===null?"No attempts":p+"% · "+letterGrade(p)}</div><div class="note">${d[k]?.total||0} graded attempts today</div></div>`}).join("")}</div>
  <div class="card" style="margin-top:12px"><h3>Recent grades</h3>${hist.length?hist.map(k=>`<div class="history-row"><span>${k}</span><strong>${letterGrade(scoreDay(dailyStats[k]))} · ${scoreDay(dailyStats[k])}%</strong></div>`).join(""):"No history yet."}</div>`;
}
function renderNoon(){document.getElementById("noonList").innerHTML=noonPhrases.map((p,i)=>phraseCard(p,"noon-"+i)).join("")}
function renderCustom(){
  const el=document.getElementById("customList"); if(!custom.length){el.innerHTML='<div class="card"><div class="eng">No custom phrases yet.</div></div>';return}
  el.innerHTML=custom.map((c,i)=>phraseCard([c.thai,c.phon,c.eng,"Your saved phrase."],"custom-"+i)+`<div class="actions"><button onclick="deleteCustom(${i})">Delete</button></div>`).join("");
}
function deleteCustom(i){custom.splice(i,1);localStorage.setItem("thaiWorldCustom",JSON.stringify(custom));renderCustom()}
function renderStreak(){
  let streak=0,d=new Date();
  for(let i=0;i<365;i++){const k=d.toISOString().slice(0,10),s=dailyStats[k],attempts=s?Object.values(s).reduce((a,x)=>a+(x.total||0),0):0;if(attempts>=5){streak++;d.setDate(d.getDate()-1)}else break}
  document.getElementById("streakPill").textContent=`${streak} day${streak===1?"":"s"} streak`;
}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{
  document.querySelectorAll("nav button").forEach(x=>x.classList.remove("active")); b.classList.add("active");
  document.querySelectorAll(".section").forEach(x=>x.classList.remove("active")); document.getElementById(b.dataset.tab).classList.add("active");
  if(b.dataset.tab==="practice")newQuiz(); if(b.dataset.tab==="flashcards")renderFlashcard(); if(b.dataset.tab==="grades")renderGrades();
});
document.getElementById("revealScenario").onclick=()=>document.getElementById("scenarioAnswer").classList.toggle("show");
document.getElementById("saveCustom").onclick=()=>{
  const eng=document.getElementById("customEng").value.trim(),thai=document.getElementById("customThai").value.trim(),phon=document.getElementById("customPhon").value.trim();
  if(!eng||!thai){alert("Add both the meaning/situation and the Thai phrase.");return}
  custom.push({eng,thai,phon});localStorage.setItem("thaiWorldCustom",JSON.stringify(custom));
  document.getElementById("customEng").value="";document.getElementById("customThai").value="";document.getElementById("customPhon").value="";renderCustom();
};
const exportBtn=document.getElementById("exportProgress");
if(exportBtn)exportBtn.onclick=()=>{
  const data={exportedAt:new Date().toISOString(),scores,custom,dailyStats};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="thai-my-world-backup.json";a.click();URL.revokeObjectURL(url);document.getElementById("backupStatus").textContent="Backup created.";
};
const importEl=document.getElementById("importProgress");
if(importEl)importEl.onchange=async e=>{
  const file=e.target.files&&e.target.files[0];if(!file)return;
  try{const data=JSON.parse(await file.text());if(data.scores)localStorage.setItem("thaiWorldScores",JSON.stringify(data.scores));if(data.custom)localStorage.setItem("thaiWorldCustom",JSON.stringify(data.custom));if(data.dailyStats)localStorage.setItem("thaiWorldDailyStats",JSON.stringify(data.dailyStats));document.getElementById("backupStatus").textContent="Backup restored. Reopen the app."}catch(err){document.getElementById("backupStatus").textContent="That backup file could not be read."}
};
renderToday();renderModules();renderNoon();renderCustom();renderReading();renderGrammar();renderVocab();renderGrades();renderStreak();
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});