// Downsample the browser's actual input rate to 16 kHz, signed little-endian PCM.
class ThaiPCM extends AudioWorkletProcessor {
  constructor() { super(); this.sum = 0; this.count = 0; this.phase = 0; this.offset = 0; this.buffer = new ArrayBuffer(640); this.view = new DataView(this.buffer); }
  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel) return true;
    for (const sample of channel) {
      this.sum += sample; this.count++; this.phase += 16000;
      if (this.phase >= sampleRate) {
        this.phase -= sampleRate;
        const value = Math.max(-1, Math.min(1, this.sum / this.count));
        this.view.setInt16(this.offset * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true);
        this.sum = 0; this.count = 0;
        if (++this.offset === 320) {
          this.port.postMessage(this.buffer, [this.buffer]);
          this.buffer = new ArrayBuffer(640); this.view = new DataView(this.buffer); this.offset = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor('thai-pcm', ThaiPCM);
