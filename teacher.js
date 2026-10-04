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
  let avatarSession = null;
  let avatarConnected = false;
  let avatarMode = "FULL";
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
    if(avatarConnected && avatarSession){
      try{
        avatarSession.repeat(text);
        return;
      }catch(err){
        setText("teacherAvatarStatus","Avatar speech failed, so I switched to the Thai voice.");
      }
    }
    try{ await speak(text,"natural"); }catch(_){ }
  }

  function saveAttempt(item, score, heard){
    const id=phraseId(item);
    const old=attempts[id]||{best:0,count:0};
    attempts[id]={best:Math.max(old.best||0,score),last:score,count:(old.count||0)+1,heard,at:new Date().toISOString()};
    localStorage.setItem("thaiTeacherAttempts",JSON.stringify(attempts));
  }

  function listen(){
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

  function setAvatarUi(connected, message){
    avatarConnected=connected;
    const fallback=el("teacherAvatarFallback"),video=el("teacherAvatarVideo"),connect=el("teacherConnectAvatar"),disconnect=el("teacherDisconnectAvatar"),badge=el("teacherAvatarBadge");
    if(fallback)fallback.style.display=connected?"none":"flex";
    if(video)video.style.display=connected?"block":"none";
    if(connect)connect.disabled=connected;
    if(disconnect)disconnect.disabled=!connected;
    if(badge)badge.textContent=connected?"LIVE AVATAR":"VOICE TEACHER";
    setText("teacherAvatarStatus",message|| (connected?"LiveAvatar connected.":"Voice teacher is ready. Connect HeyGen when you want the live video layer."));
  }

  async function attachAvatarVideo(){
    const video=el("teacherAvatarVideo");
    if(!video||!avatarSession)return false;
    for(let i=0;i<30;i++){
      try{ avatarSession.attach(video); await video.play().catch(()=>{}); if(video.srcObject || video.readyState>=2)return true; }catch(_){ }
      await new Promise(r=>setTimeout(r,350));
    }
    return false;
  }

  async function connectAvatar(){
    if(avatarConnected)return;
    const btn=el("teacherConnectAvatar"); if(btn){btn.disabled=true;btn.textContent="Connecting...";}
    setText("teacherAvatarStatus","Requesting a secure LiveAvatar session...");
    try{
      const manual=(el("teacherManualToken")?.value||"").trim();
      avatarMode=el("teacherAvatarMode")?.value||"FULL";
      let token=manual;
      if(!token){
        const backend=(el("teacherBackendUrl")?.value||neuralBackendUrl||"").trim().replace(/\/$/,"");
        if(!backend)throw new Error("Add the teacher backend URL or a temporary session token in Avatar setup.");
        const res=await fetch(backend+"/liveavatar-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:avatarMode})});
        let data={}; try{data=await res.json();}catch(_){ }
        if(!res.ok)throw new Error(data.error||"LiveAvatar token service is not configured yet.");
        token=data.session_token||data.sessionToken;
        avatarMode=data.mode||avatarMode;
      }
      if(!token)throw new Error("No LiveAvatar session token was returned.");
      setText("teacherAvatarStatus","Loading the LiveAvatar video engine...");
      const sdk=await import("https://cdn.jsdelivr.net/npm/@heygen/liveavatar-web-sdk@0.0.19/+esm");
      avatarSession=new sdk.LiveAvatarSession(token,{autoKeepAlive:true,voiceChat:{defaultMuted:true}});
      await avatarSession.start();
      const attached=await attachAvatarVideo();
      setAvatarUi(true,attached?"LiveAvatar connected. Teacher speech will use the avatar when supported by the session.":"LiveAvatar connected, but the video stream is still starting.");
    }catch(err){
      avatarSession=null;
      setAvatarUi(false,`${err.message||err} Voice Teacher still works without video.`);
    }finally{
      if(btn){btn.disabled=avatarConnected;btn.textContent="Start video avatar";}
    }
  }

  async function disconnectAvatar(){
    try{ if(avatarSession)await avatarSession.stop(); }catch(_){ }
    avatarSession=null;
    const video=el("teacherAvatarVideo"); if(video){try{video.pause();}catch(_){ } video.srcObject=null;}
    setAvatarUi(false,"Video avatar ended. Voice Teacher is still active.");
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
    el("teacherConnectAvatar")?.addEventListener("click",connectAvatar);
    el("teacherDisconnectAvatar")?.addEventListener("click",disconnectAvatar);
    document.querySelector('nav button[data-tab="teacher"]')?.addEventListener("click",renderTeacher);
    setAvatarUi(false,"Voice Teacher is ready now. LiveAvatar video will activate when a secure HeyGen session token is available.");
    renderTeacher();
  }

  init();
})();
