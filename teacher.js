(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const roleplayLabels = {
    production: "Film set / directing",
    vfx: "VFX & post",
    management: "Business & team",
    finance: "Accounting & admin",
    vendor: "Repairs & contractors",
    travel: "Travel & airport",
    restaurant: "Cooking & kitchen",
    social: "Shopping & daily life",
    partners: "Clients & partners"
  };

  let teacherMode = localStorage.getItem("thaiTeacherMode") || "today";
  let roleplayKey = localStorage.getItem("thaiTeacherRoleplay") || "production";
  let currentIndex = 0;
  let revealThai = false;
  let recognition = null;
  let liveSession = null;
  let liveConnected = false;
  let liveMemory = [];
  try { liveMemory = JSON.parse(localStorage.getItem("thaiTeacherLiveMemory") || "[]"); } catch (_) {}
  if (!Array.isArray(liveMemory)) liveMemory = [];
  let turn = {user: "", teacher: ""};
  const attempts = JSON.parse(localStorage.getItem("thaiTeacherAttempts") || "{}");

  function el(id){ return document.getElementById(id); }
  function setText(id, value){ const node = el(id); if(node) node.textContent = value; }
  function escapeHtml(value){ return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch])); }
  function normalizeThai(value){
    return String(value || "")
      .normalize("NFC")
      .replace(/[\s\u200B.,!?;:'"“”‘’()\-]/g, "")
      .replace(/(นะครับ|ครับ|ค่ะ|คะ)$/u, "");
  }
  function levenshtein(a,b){
    const aa = Array.from(a), bb = Array.from(b);
    if(!aa.length) return bb.length;
    if(!bb.length) return aa.length;
    let prev = Array.from({length:bb.length+1},(_,i)=>i);
    for(let i=1;i<=aa.length;i++){
      const cur=[i];
      for(let j=1;j<=bb.length;j++){
        cur[j]=Math.min(cur[j-1]+1, prev[j]+1, prev[j-1]+(aa[i-1]===bb[j-1]?0:1));
      }
      prev=cur;
    }
    return prev[bb.length];
  }
  function matchScore(heard,target){
    const a=normalizeThai(heard), b=normalizeThai(target);
    const max=Math.max(a.length,b.length,1);
    return Math.max(0,Math.round((1-levenshtein(a,b)/max)*100));
  }
  function phraseId(item){ return item.id || (item.module+"-teacher-"+item.index); }

  function todayPool(){
    try{
      return selectToday().map(([p,i])=>({p,id:pid(key,i),module:key,index:i,label:lesson.name}));
    }catch(_){ return []; }
  }
  function modulePool(moduleKey){
    const m=modules[moduleKey];
    if(!m) return [];
    return m.phrases.map((p,i)=>({p,id:pid(moduleKey,i),module:moduleKey,index:i,label:m.name}));
  }
  function weakPool(){
    let items=[];
    try{
      const keys=typeof activeModuleKeys==="function"?activeModuleKeys():Object.keys(modules);
      keys.forEach(k=>items.push(...modulePool(k)));
    }catch(_){ Object.keys(modules).forEach(k=>items.push(...modulePool(k))); }
    const weak=items.filter(item=>{
      const last=attempts[phraseId(item)];
      return last && last.best < 86;
    }).sort((a,b)=>(attempts[phraseId(a)]?.best||0)-(attempts[phraseId(b)]?.best||0));
    return weak.length?weak:todayPool();
  }
  function pool(){
    if(teacherMode==="roleplay") return modulePool(roleplayKey);
    if(teacherMode==="pronunciation") return weakPool();
    return todayPool();
  }
  function currentItem(){
    const items=pool();
    if(!items.length) return null;
    currentIndex=((currentIndex%items.length)+items.length)%items.length;
    return items[currentIndex];
  }

  function feedback(score){
    if(score>=92) return "Excellent. Very close to the target. Move on or say it once more at natural speed.";
    if(score>=82) return "Good. The words matched well. Say it once more without reading.";
    if(score>=65) return "Close. Listen once, then repeat the whole phrase without stopping.";
    return "Not there yet. Listen to the model, read the Thai once, then try again.";
  }

  function renderResult(message="", score=null, heard=""){
    const box=el("teacherResult");
    if(!box) return;
    if(!message && score===null){ box.innerHTML='<div class="tiny">Your speech result will appear here.</div>'; return; }
    const scoreHtml=score===null?"":`<div class="teacher-score ${score>=82?"good-score":score>=65?"mid-score":"low-score"}">${score}%</div>`;
    box.innerHTML=`${scoreHtml}<div><div class="label">${score===null?"Teacher":"Word match"}</div><div class="eng">${escapeHtml(message)}</div>${heard?`<div class="tiny" style="margin-top:6px">Heard: <strong>${escapeHtml(heard)}</strong></div>`:""}</div>`;
  }

  function renderTeacher(){
    if(liveConnected) liveSession.text("The learner selected this practice context: " + JSON.stringify(lessonContext()));
    const item=currentItem();
    if(!item) return;
    const p=item.p;
    const items=pool();
    const prompt=el("teacherPrompt");
    const thai=el("teacherTargetThai");
    const phon=el("teacherTargetPhon");
    const context=el("teacherContext");
    const counter=el("teacherCounter");
    if(prompt) prompt.textContent=p[2];
    if(thai){ thai.textContent=p[0]; thai.classList.toggle("teacher-hidden",!revealThai); }
    if(phon){ phon.textContent=p[1]||""; phon.classList.toggle("teacher-hidden",!revealThai); }
    if(context) context.textContent=teacherMode==="roleplay"?`You are in: ${roleplayLabels[roleplayKey]||item.label}`:teacherMode==="pronunciation"?"Repeat the target naturally after listening.":"Say this naturally in Thai.";
    if(counter) counter.textContent=`${currentIndex+1} of ${items.length}`;
    document.querySelectorAll(".teacher-mode").forEach(btn=>btn.classList.toggle("active",btn.dataset.mode===teacherMode));
    const roleRow=el("teacherRoleplayRow"); if(roleRow) roleRow.style.display=teacherMode==="roleplay"?"grid":"none";
    const showBtn=el("teacherShowThai"); if(showBtn) showBtn.textContent=revealThai?"Hide Thai":"Show Thai";
    const last=attempts[phraseId(item)];
    if(last) renderResult(feedback(last.last), last.last, last.heard); else renderResult();
    setText("teacherSpeechSupport", SpeechRecognition?"Speech recognition ready - Thai (th-TH).":"Speech recognition is not available in this browser. Hear + repeat still works.");
  }

  async function teacherSpeak(text){
    if(liveConnected && liveSession){ liveSession.text("Say this Thai phrase slowly, then invite me to repeat: " + text); return; }
    try{ await speak(text,"natural"); }catch(_){ }
  }

  function saveAttempt(item, score, heard){
    const id=phraseId(item);
    const old=attempts[id]||{best:0,count:0};
    attempts[id]={best:Math.max(old.best||0,score),last:score,count:(old.count||0)+1,heard,at:new Date().toISOString()};
    localStorage.setItem("thaiTeacherAttempts",JSON.stringify(attempts));
  }

  function listen(){
    if(liveSession) liveSession.stop("Switched to scored phrase practice. Voice Teacher is ready.");
    const item=currentItem();
    if(!item) return;
    if(!SpeechRecognition){
      renderResult("Speech recognition is unavailable here. Listen to the teacher, repeat aloud, then use Again or Next.");
      return;
    }
    if(recognition){ try{recognition.abort();}catch(_){ } }
    recognition=new SpeechRecognition();
    recognition.lang="th-TH";
    recognition.continuous=false;
    recognition.interimResults=false;
    recognition.maxAlternatives=5;
    recognition.onstart=()=>{
      const btn=el("teacherSpeakNow"); if(btn){btn.classList.add("listening");btn.textContent="Listening...";}
      renderResult("Listening. Say the full Thai phrase naturally.");
    };
    recognition.onerror=(event)=>{
      const btn=el("teacherSpeakNow"); if(btn){btn.classList.remove("listening");btn.textContent="Speak now";}
      renderResult(event.error==="not-allowed"?"Microphone permission is off. Allow microphone access for Thai My World and try again.":"I could not hear that clearly. Try once more.");
    };
    recognition.onend=()=>{
      const btn=el("teacherSpeakNow"); if(btn){btn.classList.remove("listening");btn.textContent="Speak now";}
    };
    recognition.onresult=(event)=>{
      const alternatives=Array.from(event.results[0]||[]);
      let best={transcript:"",score:-1};
      alternatives.forEach(a=>{
        const s=matchScore(a.transcript,item.p[0]);
        if(s>best.score) best={transcript:a.transcript,score:s};
      });
      if(best.score<0) return;
      saveAttempt(item,best.score,best.transcript);
      revealThai=true;
      const thai=el("teacherTargetThai"),phon=el("teacherTargetPhon");
      if(thai)thai.classList.remove("teacher-hidden"); if(phon)phon.classList.remove("teacher-hidden");
      renderResult(feedback(best.score),best.score,best.transcript);
    };
    try{recognition.start();}catch(_){renderResult("Microphone is busy. Try again.");}
  }

  function next(){ currentIndex++; revealThai=false; renderTeacher(); }
  function previous(){ currentIndex--; revealThai=false; renderTeacher(); }

  function setMode(mode){
    teacherMode=mode;
    localStorage.setItem("thaiTeacherMode",teacherMode);
    currentIndex=0; revealThai=false; renderTeacher();
  }

  function populateRoleplays(){
    const select=el("teacherRoleplaySelect"); if(!select)return;
    select.innerHTML=Object.keys(roleplayLabels).filter(k=>modules[k]).map(k=>`<option value="${k}">${roleplayLabels[k]}</option>`).join("");
    if(modules[roleplayKey])select.value=roleplayKey; else {roleplayKey=select.value;}
    select.onchange=()=>{roleplayKey=select.value;localStorage.setItem("thaiTeacherRoleplay",roleplayKey);currentIndex=0;revealThai=false;renderTeacher();};
  }

  function lessonContext(){
    const item = currentItem();
    return {
      mode: teacherMode, situation: roleplayLabels[roleplayKey],
      current: item ? {thai: item.p[0], english: item.p[2], id: phraseId(item)} : null,
      lesson: pool().slice(0, 12).map(i => ({thai: i.p[0], english: i.p[2]})),
      weak: weakPool().slice(0, 6).map(i => ({thai: i.p[0], english: i.p[2]})),
      recentConversation: liveMemory.slice(-6)
    };
  }

  function saveTurn(){
    if(turn.user || turn.teacher){
      liveMemory.push({user: turn.user.slice(0, 1500), teacher: turn.teacher.slice(0, 2500)});
      liveMemory = liveMemory.slice(-6);
      try { localStorage.setItem("thaiTeacherLiveMemory", JSON.stringify(liveMemory)); } catch (_) {}
      turn = {user: "", teacher: ""};
    }
  }

  function setLiveUi(connected, message){
    liveConnected = connected;
    if(!connected) liveSession = null;
    el("teacherConnectLive").disabled = connected;
    el("teacherConnectLive").textContent = "Start Gemini Live";
    el("teacherDisconnectLive").disabled = !connected;
    el("teacherMuteLive").disabled = !connected;
    el("teacherMuteLive").textContent = "Mute microphone";
    setText("teacherLiveBadge", connected ? "GEMINI LIVE · MICROPHONE ON" : "VOICE TEACHER");
    setText("teacherLiveStatus", message);
  }

  async function connectLive(){
    if(liveSession) return;
    let session;
    try {
      const backend = new URL(el("teacherBackendUrl").value.trim());
      if(backend.protocol !== "https:" || backend.username || backend.password || backend.search || backend.hash)
        throw new Error("Use an HTTPS backend URL without credentials or query parameters.");
      const code = el("teacherAccessCode").value.trim();
      if(!code) throw new Error("Enter your private teacher access code in Gemini setup first.");
      if(!navigator.mediaDevices?.getUserMedia || !window.AudioWorkletNode) throw new Error("This browser cannot stream live audio. Voice Teacher still works.");
      if(recognition) { recognition.abort(); recognition = null; }
      window.speechSynthesis?.cancel();
      if(typeof currentAudio !== "undefined" && currentAudio) currentAudio.pause();
      el("teacherConnectLive").disabled = true;
      el("teacherConnectLive").textContent = "Connecting…";
      el("teacherDisconnectLive").disabled = false;
      setText("teacherLiveStatus", "Connecting securely. Allow microphone access when prompted.");
      liveSession = new window.GeminiTeacher({
        status: setLiveUi,
        transcript: (who, text) => {
          turn[who] = (turn[who] + text).slice(-4000);
          setText(who === "user" ? "teacherLiveHeard" : "teacherLiveReply", turn[who]);
        },
        turnComplete: saveTurn
      });
      session = liveSession;
      el("teacherAccessCode").value = "";
      await session.start(backend.href.replace(/\/$/, ""), code, lessonContext());
    } catch(err) {
      if(session?.closed) return;
      const message = (err.name === "NotAllowedError" ? "Microphone permission was denied." : err.message || "Connection failed.") + " Voice Teacher is ready.";
      if(liveSession) liveSession.stop(message); else setLiveUi(false, message);
    }
  }

  function init(){
    const section=el("teacher"); if(!section)return;
    populateRoleplays();
    const backend=el("teacherBackendUrl");
    if(backend){
      backend.value=(typeof neuralBackendUrl!=="undefined"?neuralBackendUrl:"")||"";
      backend.onchange=()=>localStorage.setItem("thaiTeacherBackendUrl",backend.value.trim());
      const saved=localStorage.getItem("thaiTeacherBackendUrl");
      if(saved)backend.value=saved;
    }
    document.querySelectorAll(".teacher-mode").forEach(btn=>btn.addEventListener("click",()=>setMode(btn.dataset.mode)));
    el("teacherHear")?.addEventListener("click",()=>{const item=currentItem();if(item)teacherSpeak(item.p[0]);});
    el("teacherSpeakNow")?.addEventListener("click",listen);
    el("teacherShowThai")?.addEventListener("click",()=>{revealThai=!revealThai;renderTeacher();});
    el("teacherNext")?.addEventListener("click",next);
    el("teacherPrevious")?.addEventListener("click",previous);
    el("teacherConnectLive")?.addEventListener("click",connectLive);
    el("teacherDisconnectLive")?.addEventListener("click",()=>liveSession?.stop());
    el("teacherMuteLive")?.addEventListener("click",()=>{
      if(!liveConnected)return;
      const muted = liveSession.mute();
      setText("teacherMuteLive", muted ? "Unmute microphone" : "Mute microphone");
      setText("teacherLiveBadge", muted ? "GEMINI LIVE · MUTED" : "GEMINI LIVE · MICROPHONE ON");
    });
    el("teacherClearMemory")?.addEventListener("click",()=>{
      liveSession?.stop(); liveMemory = []; turn = {user: "", teacher: ""};
      localStorage.removeItem("thaiTeacherLiveMemory");
      setText("teacherLiveHeard", ""); setText("teacherLiveReply", "");
      setText("teacherLiveStatus", "Conversation memory cleared. Lesson progress is preserved.");
    });
    window.addEventListener("pagehide",()=>liveSession?.stop());
    document.addEventListener("visibilitychange",()=>{if(document.hidden)liveSession?.stop("Live paused because the app was hidden. Voice Teacher is ready.");});
    document.querySelectorAll('nav button').forEach(button=>button.addEventListener("click",()=>{
      if(button.dataset.tab !== "teacher") liveSession?.stop();
    }));
    document.querySelector('nav button[data-tab="teacher"]')?.addEventListener("click",renderTeacher);
    setLiveUi(false,"Voice Teacher is ready. Start Gemini Live for an interactive conversation after server setup.");
    renderTeacher();
  }

  init();
})();
