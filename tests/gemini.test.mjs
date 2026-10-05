import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {geminiLive} from '../backend/gemini-live.js';
import worker from '../backend/cloudflare-worker.js';

const origin = 'https://dalessio-cmyk.github.io';
const code = 'test-only-private-code-32-characters';
const env = {GEMINI_API_KEY: 'test-api-secret', TEACHER_ACCESS_CODE: code, TEACHER_RATE_LIMITER: {limit: async () => ({success:true})}};
const request = (options = {}) => new Request('https://test.invalid/gemini-live-token', {
  method: 'POST', body: '{}', ...options,
  headers: {Origin: origin, Authorization: 'Bearer ' + code, 'Content-Type':'application/json', ...options.headers}
});

test('broker rejects unauthorized and unconfigured calls before Google', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Unexpected upstream call'); };
  try {
    for (const [req, config, status] of [
      [request({headers:{Origin:'https://evil.invalid'}}), env, 403],
      [request({headers:{Origin:'http://localhost.evil.invalid'}}), env, 403],
      [request({headers:{Authorization:''}}), env, 401],
      [request(), {...env,GEMINI_API_KEY:''}, 503],
      [request(), {...env,TEACHER_ACCESS_CODE:'short'}, 503],
      [request(), {...env,TEACHER_RATE_LIMITER:null}, 503],
      [request(), {...env,TEACHER_RATE_LIMITER:{limit:async()=>({success:false})}}, 429],
      [request({body:'x'.repeat(1025)}), env, 413],
      [request({headers:{'Content-Type':'text/plain'}}), env, 415]
    ]) {
      const response = await geminiLive(req, config);
      assert.equal(response.status,status);
      assert.equal(response.headers.get('Cache-Control'),'no-store');
    }
    const preflight = await geminiLive(new Request('https://test.invalid/gemini-live-token',{method:'OPTIONS',headers:{Origin:origin}}),{});
    assert.equal(preflight.status,204);
    assert.match(preflight.headers.get('Access-Control-Allow-Headers'),/Authorization/);
    const legacy = await worker.fetch(new Request('https://test.invalid/tts',{method:'POST',headers:{Origin:origin}}),{});
    assert.equal(legacy.status,503);
    assert.match(await legacy.text(),/Voice service/);
  } finally { globalThis.fetch = original; }
});

test('broker constrains single-use short-lived tokens and redacts upstream failures', async () => {
  const original = globalThis.fetch;
  let payload;
  globalThis.fetch = async (url, options) => {
    assert.equal(url,'https://generativelanguage.googleapis.com/v1beta/auth_tokens');
    assert.equal(options.headers['x-goog-api-key'],'test-api-secret');
    payload = JSON.parse(options.body);
    return Response.json({name:'auth_tokens/test-ephemeral'});
  };
  try {
    const response = await worker.fetch(request({body:JSON.stringify({model:'attacker-model'})}),env);
    assert.equal(response.status,200);
    assert.equal(payload.uses,1);
    assert.equal(payload.liveConnectConstraints.model,'models/gemini-3.8-live');
    assert.deepEqual(payload.liveConnectConstraints.config.responseModalities,['AUDIO']);
    assert.ok(Date.parse(payload.newSessionExpireTime)-Date.now() <= 60000);
    assert.ok(Date.parse(payload.expireTime)-Date.now() <= 600000);
    assert.ok(!JSON.stringify(await response.json()).includes(env.GEMINI_API_KEY));
    globalThis.fetch = async () => new Response('sensitive-provider-detail',{status:403});
    const failure = await geminiLive(request(),env);
    assert.equal(failure.status,502); assert.ok(!(await failure.text()).includes('sensitive-provider-detail'));
  } finally { globalThis.fetch = original; }
});

function clientHarness() {
  let trackStopped = false, socket;
  const track = {enabled:true,stop(){trackStopped=true;}};
  const audio = {state:'running',currentTime:0,sampleRate:24000,destination:{},audioWorklet:{addModule:async()=>{}},
    resume:async()=>{},close:async()=>{audio.state='closed';},
    createMediaStreamSource:()=>({connect(){},disconnect(){}}),
    createGain:()=>({gain:{},connect(){},disconnect(){}}),
    createBuffer:(_,length,rate)=>({duration:length/rate,getChannelData:()=>new Float32Array(length)}),
    createBufferSource:()=>({connect(){},disconnect(){},start(){},stop(){this.stopped=true;}})};
  const updates = [], transcripts = [];
  const context = {window:{},AudioContext:function(){return audio;},AudioWorkletNode:class {port={};connect(){}disconnect(){}},
    navigator:{mediaDevices:{getUserMedia:async()=>({getTracks:()=>[track],getAudioTracks:()=>[track]})}},
    WebSocket:class {static OPEN=1;readyState=1;bufferedAmount=0;sent=[];constructor(url){this.url=url;socket=this;}send(m){this.sent.push(JSON.parse(m));}close(){this.readyState=3;}},
    fetch:async()=>Response.json({token:'auth_tokens/test',model:'models/gemini-3.8-live'}),
    AbortController,setTimeout,clearTimeout,Uint8Array,DataView,atob,btoa};
  vm.runInNewContext(readFileSync(new URL('../gemini-live.js',import.meta.url),'utf8'),context);
  const client = new context.window.GeminiTeacher({status:(...v)=>updates.push(v),transcript:(...v)=>transcripts.push(v),turnComplete(){}});
  return {client,audio,context,updates,transcripts,track,get socket(){return socket;},get trackStopped(){return trackStopped;}};
}

test('client waits for setup, transcribes, mutes, interrupts and cleans up',async()=>{
  const h=clientHarness();
  await h.client.start('https://test.invalid',code,{mode:'roleplay'});
  try {
    h.socket.onopen();
    assert.deepEqual(h.socket.sent[0],{setup:{model:'models/gemini-3.8-live'}});
    assert.match(h.socket.url,/BidiGenerateContentConstrained\?access_token=/);
    assert.ok(!h.socket.url.includes(code));
    const message = async data => {h.socket.onmessage({data:JSON.stringify(data)});await new Promise(r=>setImmediate(r));};
    await message({setupComplete:{}});
    assert.equal(h.client.ready,true);
    assert.match(h.socket.sent[1].realtimeInput.text,/roleplay/);
    h.client.mute();assert.equal(h.track.enabled,false);assert.equal(h.socket.sent.at(-1).realtimeInput.audioStreamEnd,true);
    h.client.mute();assert.equal(h.track.enabled,true);
    await message({serverContent:{inputTranscription:{text:'สวัสดี'},outputTranscription:{text:'Hello'},modelTurn:{parts:[{inlineData:{data:'AAAAAA==',mimeType:'audio/pcm;rate=24000'}}]}}});
    assert.equal(h.transcripts.length,2);assert.equal(h.client.sources.size,1);
    await message({serverContent:{interrupted:true}});assert.equal(h.client.sources.size,0);
  } finally {h.client.stop();}
  assert.equal(h.trackStopped,true);assert.equal(h.audio.state,'closed');assert.equal(h.socket.readyState,3);
  assert.equal(h.updates.at(-1)[0],false);
});

test('late microphone grant after cancel immediately releases tracks',async()=>{
  const h=clientHarness();let resolve;
  h.context.navigator.mediaDevices.getUserMedia=()=>new Promise(r=>resolve=r);
  const starting=h.client.start('https://test.invalid',code,{});
  await new Promise(r=>setImmediate(r));
  h.client.stop();
  let stopped=false;resolve({getTracks:()=>[{stop(){stopped=true;}}]});
  await starting;assert.equal(stopped,true);assert.equal(h.socket,undefined);
});

test('PCM worklet downsampling produces 16 kHz little-endian frames',()=>{
  let Worklet;const frames=[];
  vm.runInNewContext(readFileSync(new URL('../gemini-pcm-worklet.js',import.meta.url),'utf8'),{
    AudioWorkletProcessor:class {port={postMessage:b=>frames.push(b)};},sampleRate:48000,
    registerProcessor:(_,cls)=>{Worklet=cls;},ArrayBuffer,DataView,Math
  });
  const processor=new Worklet();
  processor.process([[new Float32Array(960).fill(0.5)]]);
  assert.equal(frames.length,1);assert.equal(frames[0].byteLength,640);
  assert.equal(new DataView(frames[0]).getInt16(0,true),16384);
});
