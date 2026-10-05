// Audio and socket lifecycle are isolated so the original teacher remains usable.
(() => {
  class GeminiTeacher {
    constructor(callbacks) { this.cb = callbacks; this.sources = new Set(); this.closed = false; this.ready = false; this.muted = false; }
    async start(backend, accessCode, context) {
      this.audio = new AudioContext({sampleRate: 24000});
      await this.audio.resume();
      if (this.closed) return;
      this.abort = new AbortController();
      this.cb.progress?.('Waiting for microphone permission. Choose Allow in your browser.');
      this.timeout = setTimeout(() => this.stop('Microphone permission did not complete. Allow microphone access or open this app in Chrome or Safari, then retry.'), 60000);
      const stream = await navigator.mediaDevices.getUserMedia({audio: {channelCount: 1, echoCancellation: true, noiseSuppression: true}, video: false});
      if (this.closed) { stream.getTracks().forEach(t => t.stop()); return; }
      this.stream = stream;
      clearTimeout(this.timeout);
      this.cb.progress?.('Microphone ready. Requesting a secure Gemini session…');
      this.timeout = setTimeout(() => this.stop('Gemini connection timed out. Voice Teacher is ready.'), 25000);
      const response = await fetch(backend + '/gemini-live-token', {
        method: 'POST', headers: {'Content-Type': 'application/json', Authorization: 'Bearer ' + accessCode},
        body: '{}', cache: 'no-store', credentials: 'omit', signal: this.abort.signal
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Gemini backend is not ready.');
      if (this.closed) return;
      if (typeof data.token !== 'string' || !data.token.startsWith('auth_tokens/') || !/^models\/[a-z0-9.-]+$/.test(data.model)) throw new Error('Invalid live session response.');
      await this.audio.audioWorklet.addModule('./gemini-pcm-worklet.js');
      if (this.closed) return;
      this.input = this.audio.createMediaStreamSource(stream);
      this.processor = new AudioWorkletNode(this.audio, 'thai-pcm');
      this.silent = this.audio.createGain(); this.silent.gain.value = 0;
      this.input.connect(this.processor); this.processor.connect(this.silent); this.silent.connect(this.audio.destination);
      this.processor.port.onmessage = event => {
        if (!this.ready || this.muted || this.closed) return;
        if (this.socket.bufferedAmount > 128000) { this.stop('Connection is too slow. Voice Teacher is ready.'); return; }
        const bytes = new Uint8Array(event.data);
        let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
        this.send({realtimeInput: {audio: {data: btoa(binary), mimeType: 'audio/pcm;rate=16000'}}});
      };
      this.cb.progress?.('Secure session received. Connecting to Gemini…');
      this.socket = new WebSocket('wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=' + encodeURIComponent(data.token));
      this.socket.onopen = () => this.send({setup: {model: data.model}});
      // Serialize Blob decoding to preserve audio/transcription order.
      let chain = Promise.resolve();
      this.socket.onmessage = event => { chain = chain.then(async () => {
        if (this.closed) return;
        const message = JSON.parse(typeof event.data === 'string' ? event.data : await event.data.text());
        if (this.closed) return;
        if (message.error) throw new Error('Gemini session error.');
        if (message.setupComplete) {
          clearTimeout(this.timeout); this.ready = true;
          this.limit = setTimeout(() => this.stop('Nine-minute practice complete. Start again to continue with saved context.'), 9 * 60000);
          this.cb.status(true, 'Gemini is listening. You can interrupt naturally. Use headphones to avoid echo.');
          this.text('Start a short Thai practice session using this learner context: ' + JSON.stringify(context));
        }
        if (message.goAway) { this.stop('Gemini is ending this session. Start again to continue with saved context.'); return; }
        const content = message.serverContent || {};
        if (content.interrupted) this.clearAudio();
        if (content.inputTranscription?.text) this.cb.transcript('user', content.inputTranscription.text);
        if (content.outputTranscription?.text) this.cb.transcript('teacher', content.outputTranscription.text);
        for (const part of content.modelTurn?.parts || []) {
          if (part.inlineData?.mimeType?.startsWith('audio/pcm')) this.play(part.inlineData.data, part.inlineData.mimeType);
        }
        if (content.turnComplete) this.cb.turnComplete();
      }).catch(() => this.stop('Live connection failed. Voice Teacher is ready.')); };
      this.socket.onerror = () => this.stop('Live connection failed. Check API access and try again. Voice Teacher is ready.');
      this.socket.onclose = () => this.stop('Live session ended. Voice Teacher is ready.');
    }
    send(message) { if (!this.closed && this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(message)); }
    text(text) { if (this.ready) this.send({realtimeInput: {text}}); }
    mute() {
      this.muted = !this.muted;
      this.stream?.getAudioTracks().forEach(track => { track.enabled = !this.muted; });
      if (this.muted) this.send({realtimeInput: {audioStreamEnd: true}});
      return this.muted;
    }
    play(base64, mime) {
      const binary = atob(base64), bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const view = new DataView(bytes.buffer);
      const rate = Number(/rate=(\d+)/.exec(mime)?.[1] || 24000);
      const buffer = this.audio.createBuffer(1, Math.floor(bytes.length / 2), rate);
      const floats = buffer.getChannelData(0);
      for (let i = 0; i < floats.length; i++) floats[i] = view.getInt16(i * 2, true) / 32768;
      const source = this.audio.createBufferSource(); source.buffer = buffer; source.connect(this.audio.destination);
      this.playAt = Math.max(this.playAt || 0, this.audio.currentTime);
      if (this.playAt - this.audio.currentTime > 30) throw new Error('Audio backlog');
      source.start(this.playAt); this.playAt += buffer.duration;
      this.sources.add(source); source.onended = () => { this.sources.delete(source); source.disconnect(); };
    }
    clearAudio() { for (const source of this.sources) { try { source.stop(); source.disconnect(); } catch (_) {} } this.sources.clear(); this.playAt = 0; }
    stop(message = 'Live ended. Voice Teacher is ready.') {
      if (this.closed) return;
      this.closed = true; this.ready = false;
      clearTimeout(this.timeout); clearTimeout(this.limit); this.abort?.abort();
      this.stream?.getTracks().forEach(track => track.stop());
      if (this.processor) { this.processor.port.onmessage = null; this.processor.disconnect(); }
      this.input?.disconnect(); this.silent?.disconnect(); this.clearAudio();
      if (this.socket) { this.socket.onclose = null; this.socket.onerror = null; this.socket.close(); }
      if (this.audio?.state !== 'closed') this.audio?.close().catch(() => {});
      this.cb.turnComplete(); this.cb.status(false, message);
    }
  }
  window.GeminiTeacher = GeminiTeacher;
})();
