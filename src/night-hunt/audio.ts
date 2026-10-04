import type { HuntCue } from "./types";

type Voice = AudioScheduledSourceNode;

/** A small, original score and foley instrument. No downloads or audio credentials. */
export class HuntAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private effects: GainNode | null = null;
  private room: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private droneOscillators: OscillatorNode[] = [];
  private voices = new Set<Voice>();
  private clock: ReturnType<typeof setInterval> | null = null;
  private suspendTimer: ReturnType<typeof setTimeout> | null = null;
  private resumePending: Promise<void> | null = null;
  private phase: 1 | 2 = 1;
  private muted = false;
  private paused = false;
  private started = false;
  private destroyed = false;
  private ending = false;
  private beat = 0;
  private nextBeat = 0;

  async start(): Promise<void> {
    if (this.destroyed) return;
    this.started = true;
    if (!this.context) {
      try {
        const AudioConstructor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioConstructor) return;
        this.context = new AudioConstructor({ latencyHint: "interactive" });
        this.createGraph();
      } catch {
        // A silent game remains playable when a browser blocks Web Audio.
        return;
      }
    }
    await this.syncPlayback();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    void this.syncPlayback();
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    void this.syncPlayback();
  }

  setPhase(phase: 1 | 2): void {
    this.phase = phase;
    this.ending = false;
    this.beat = 0;
    if (!this.context) return;
    this.nextBeat = this.context.currentTime + 0.2;
    const notes = phase === 1 ? [36.71, 73.42, 110.1] : [36.71, 77.78, 110.32];
    this.droneOscillators.forEach((oscillator, index) => {
      oscillator.frequency.setTargetAtTime(
        notes[index],
        this.context!.currentTime,
        1.4,
      );
    });
    this.setMusicLevel(phase === 1 ? 0.52 : 0.65, 1.1);
  }

  cue(name: HuntCue): void {
    const context = this.context;
    if (
      !context ||
      !this.started ||
      this.muted ||
      this.paused ||
      this.destroyed
    )
      return;
    if (context.state !== "running") {
      void this.syncPlayback();
      return;
    }
    const now = context.currentTime;
    switch (name) {
      case "slash":
        this.noise(now, 0.15, 0.12, 3100, 720, "bandpass", -0.15);
        this.tone(now, 0.11, 175, 82, 0.065, "triangle");
        break;
      case "hit":
        this.tone(now, 0.19, 145, 41, 0.24, "sine");
        this.noise(now, 0.1, 0.15, 2000, 560, "highpass");
        this.tone(now, 0.08, 390, 148, 0.05, "triangle");
        break;
      case "dodge":
        this.noise(now, 0.21, 0.12, 1100, 330, "bandpass", 0.22);
        break;
      case "perfect":
        this.duckMusic(now, 0.55);
        this.noise(now, 0.28, 0.085, 650, 2900, "bandpass", -0.28);
        this.bell(now + 0.02, 1174.66, 0.042, 0.75, this.effects!, 0.18);
        break;
      case "parry":
        this.duckMusic(now, 0.36);
        this.noise(now, 0.06, 0.17, 2700, 1700, "highpass");
        this.tone(now, 0.09, 510, 180, 0.13, "triangle");
        this.bell(now, 1108.73, 0.078, 1.15, this.effects!, 0.02);
        break;
      case "hurt":
        this.tone(now, 0.31, 92, 31, 0.2, "sine");
        this.noise(now, 0.2, 0.14, 700, 190, "lowpass");
        break;
      case "windup":
        this.tone(now, 0.48, 48, 104, 0.064, "triangle", this.effects!, 0.16);
        this.noise(now, 0.34, 0.047, 480, 1800, "bandpass");
        break;
      case "slam":
        this.duckMusic(now, 0.65);
        this.tone(now, 0.68, 83, 26, 0.31, "sine");
        this.noise(now, 0.58, 0.25, 1700, 140, "lowpass");
        this.noise(now + 0.09, 0.36, 0.06, 3000, 760, "bandpass", -0.45);
        this.noise(now + 0.17, 0.29, 0.05, 2100, 900, "bandpass", 0.45);
        break;
      case "phase":
        this.duckMusic(now, 1.25);
        this.bell(now, 65.41, 0.18, 4.8, this.effects!);
        this.noise(now + 0.15, 1.3, 0.1, 280, 2300, "bandpass", 0, 0.32);
        break;
      case "death":
        this.finishMusic();
        this.tone(now, 1.35, 72, 24, 0.16, "sine");
        this.noise(now, 0.8, 0.09, 900, 110, "lowpass");
        break;
      case "victory":
        this.finishMusic();
        [220, 261.63, 329.63, 440].forEach((note, index) => {
          this.bell(
            now + index * 0.22,
            note,
            0.045,
            2.8,
            this.effects!,
            (index - 1.5) * 0.16,
          );
        });
        break;
    }
  }

  destroy(): void {
    this.destroyed = true;
    this.stopClock();
    if (this.suspendTimer !== null) clearTimeout(this.suspendTimer);
    this.suspendTimer = null;
    for (const voice of this.voices) {
      try {
        voice.stop();
      } catch {
        /* Already finished. */
      }
      voice.disconnect();
    }
    this.voices.clear();
    this.droneOscillators = [];
    this.master?.disconnect();
    this.music?.disconnect();
    this.effects?.disconnect();
    this.room?.disconnect();
    const context = this.context;
    this.context = null;
    this.noiseBuffer = null;
    if (context && context.state !== "closed")
      void context.close().catch(() => undefined);
  }

  private createGraph(): void {
    const context = this.context!;
    this.master = context.createGain();
    this.master.gain.value = 0;
    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = -17;
    limiter.knee.value = 12;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.19;
    this.master.connect(limiter);
    limiter.connect(context.destination);
    this.music = context.createGain();
    this.music.gain.value = this.phase === 1 ? 0.52 : 0.65;
    this.effects = context.createGain();
    this.effects.gain.value = 0.78;
    this.music.connect(this.master);
    this.effects.connect(this.master);

    // A short, dark room gives metal a tail without blurring combat transients.
    this.room = context.createGain();
    this.room.gain.value = 0.16;
    const reverb = context.createConvolver();
    const impulse = context.createBuffer(
      2,
      Math.ceil(context.sampleRate * 1.8),
      context.sampleRate,
    );
    for (let channel = 0; channel < 2; channel += 1) {
      const samples = impulse.getChannelData(channel);
      let previous = 0;
      for (let index = 0; index < samples.length; index += 1) {
        previous = previous * 0.6 + (Math.random() * 2 - 1) * 0.4;
        samples[index] = previous * Math.pow(1 - index / samples.length, 3.4);
      }
    }
    reverb.buffer = impulse;
    const roomFilter = context.createBiquadFilter();
    roomFilter.type = "lowpass";
    roomFilter.frequency.value = 3600;
    this.room.connect(reverb);
    reverb.connect(roomFilter);
    roomFilter.connect(this.master);

    this.noiseBuffer = context.createBuffer(
      1,
      context.sampleRate * 3,
      context.sampleRate,
    );
    const samples = this.noiseBuffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1)
      samples[index] = Math.random() * 2 - 1;

    const wind = context.createBufferSource();
    wind.buffer = this.noiseBuffer;
    wind.loop = true;
    const windFilter = context.createBiquadFilter();
    windFilter.type = "lowpass";
    windFilter.frequency.value = 360;
    const windGain = context.createGain();
    windGain.gain.value = 0.115;
    wind.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.music);
    wind.start();
    this.track(wind, [windFilter, windGain]);
    const breath = context.createOscillator();
    const breathDepth = context.createGain();
    breath.frequency.value = 0.095;
    breathDepth.gain.value = 140;
    breath.connect(breathDepth);
    breathDepth.connect(windFilter.frequency);
    breath.start();
    this.track(breath, [breathDepth]);

    [36.71, 73.42, 110.1].forEach((frequency, index) => {
      const drone = context.createOscillator();
      const gain = context.createGain();
      drone.type = index === 1 ? "triangle" : "sine";
      drone.frequency.value = frequency;
      gain.gain.value = [0.073, 0.024, 0.017][index];
      drone.connect(gain);
      gain.connect(this.music!);
      drone.start();
      this.droneOscillators.push(drone);
      this.track(drone, [gain]);
    });
  }

  private async syncPlayback(): Promise<void> {
    const context = this.context;
    if (!context || this.destroyed) return;
    if (this.suspendTimer !== null) clearTimeout(this.suspendTimer);
    this.suspendTimer = null;
    if (this.muted || this.paused || !this.started) {
      this.stopClock();
      const now = context.currentTime;
      this.master!.gain.cancelScheduledValues(now);
      this.master!.gain.setTargetAtTime(0, now, 0.01);
      this.suspendTimer = setTimeout(() => {
        this.suspendTimer = null;
        if (
          !this.destroyed &&
          (this.muted || this.paused) &&
          context.state === "running"
        ) {
          void context.suspend().catch(() => undefined);
        }
      }, 65);
      return;
    }
    if (context.state !== "running") {
      if (!this.resumePending) {
        this.resumePending = context
          .resume()
          .catch(() => undefined)
          .finally(() => {
            this.resumePending = null;
          });
      }
      await this.resumePending;
    }
    if (
      this.destroyed ||
      this.muted ||
      this.paused ||
      context.state !== "running"
    )
      return;
    this.master!.gain.cancelScheduledValues(context.currentTime);
    this.master!.gain.setTargetAtTime(0.68, context.currentTime, 0.08);
    if (this.clock === null) {
      this.nextBeat = context.currentTime + 0.12;
      this.clock = setInterval(() => this.scheduleMusic(), 80);
      this.scheduleMusic();
    }
  }

  private stopClock(): void {
    if (this.clock !== null) clearInterval(this.clock);
    this.clock = null;
  }

  private scheduleMusic(): void {
    const context = this.context;
    if (
      !context ||
      context.state !== "running" ||
      this.ending ||
      this.destroyed
    )
      return;
    // Do not catch up with a burst of old notes after a background tab returns.
    if (this.nextBeat < context.currentTime - 0.2)
      this.nextBeat = context.currentTime + 0.04;
    while (this.nextBeat < context.currentTime + 0.18) {
      const time = this.nextBeat;
      const secondPhase = this.phase === 2;
      if (this.beat % 4 === 0) {
        const phrase = [146.83, 174.61, 130.81, 164.81];
        const note = phrase[Math.floor(this.beat / 4) % phrase.length];
        this.bell(
          time,
          note,
          secondPhase ? 0.036 : 0.031,
          2.6,
          this.music!,
          Math.sin(this.beat) * 0.4,
        );
      }
      if (this.beat % 2 === 0 || secondPhase) {
        this.tone(
          time,
          0.32,
          secondPhase ? 64 : 50,
          32,
          secondPhase ? 0.1 : 0.067,
          "sine",
          this.music!,
        );
      }
      if (secondPhase) {
        this.noise(
          time + 0.23,
          0.055,
          0.033,
          3200,
          1400,
          "bandpass",
          this.beat % 2 ? -0.5 : 0.5,
          0.003,
          this.music!,
        );
        if (this.beat % 2 === 1)
          this.tone(
            time,
            0.2,
            155.56,
            155.56,
            0.018,
            "triangle",
            this.music!,
            0.035,
          );
      }
      this.beat += 1;
      this.nextBeat += 60 / (secondPhase ? 112 : 70);
    }
  }

  private tone(
    time: number,
    duration: number,
    frequency: number,
    endFrequency: number,
    volume: number,
    type: OscillatorType,
    destination = this.effects!,
    attack = 0.006,
  ): void {
    const context = this.context!;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(16, endFrequency),
      time + duration,
    );
    this.envelope(gain.gain, time, duration, volume, attack);
    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.02);
    this.track(oscillator, [gain]);
  }

  private noise(
    time: number,
    duration: number,
    volume: number,
    frequency: number,
    endFrequency: number,
    type: BiquadFilterType,
    pan = 0,
    attack = 0.006,
    destination = this.effects!,
  ): void {
    const context = this.context!;
    const source = context.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = context.createBiquadFilter();
    filter.type = type;
    filter.Q.value = 0.75;
    filter.frequency.setValueAtTime(frequency, time);
    filter.frequency.exponentialRampToValueAtTime(
      endFrequency,
      time + duration,
    );
    const gain = context.createGain();
    const panner = context.createStereoPanner();
    panner.pan.value = pan;
    this.envelope(gain.gain, time, duration, volume, attack);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(destination);
    source.start(time, Math.random() * Math.max(0, 3 - duration));
    source.stop(time + duration + 0.02);
    this.track(source, [filter, gain, panner]);
  }

  private bell(
    time: number,
    frequency: number,
    volume: number,
    duration: number,
    destination: AudioNode,
    pan = 0,
  ): void {
    // Slightly inharmonic partials: a struck iron bell, not a notification sound.
    [1, 2.013, 2.987, 4.073].forEach((partial, index) => {
      const context = this.context!;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const panner = context.createStereoPanner();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency * partial;
      panner.pan.value = pan;
      const tail = duration / (1 + index * 0.3);
      this.envelope(gain.gain, time, tail, volume / (1 + index * 1.65), 0.008);
      oscillator.connect(gain);
      gain.connect(panner);
      panner.connect(destination);
      // Send only this voice, so stopping or muting affects the reverb as well.
      panner.connect(this.room!);
      oscillator.start(time);
      oscillator.stop(time + tail + 0.02);
      this.track(oscillator, [gain, panner]);
    });
  }

  private envelope(
    parameter: AudioParam,
    time: number,
    duration: number,
    volume: number,
    attack: number,
  ): void {
    parameter.setValueAtTime(0, time);
    parameter.linearRampToValueAtTime(
      volume,
      time + Math.min(attack, duration * 0.45),
    );
    parameter.exponentialRampToValueAtTime(0.0001, time + duration);
    parameter.linearRampToValueAtTime(0, time + duration + 0.015);
  }

  private track(source: Voice, nodes: AudioNode[]): void {
    this.voices.add(source);
    source.onended = () => {
      this.voices.delete(source);
      source.disconnect();
      nodes.forEach((node) => node.disconnect());
    };
  }

  private duckMusic(time: number, duration: number): void {
    if (!this.music || this.ending) return;
    const level = this.phase === 1 ? 0.52 : 0.65;
    this.music.gain.cancelScheduledValues(time);
    this.music.gain.setTargetAtTime(level * 0.32, time, 0.015);
    this.music.gain.setTargetAtTime(level, time + duration, 0.24);
  }

  private setMusicLevel(level: number, ease: number): void {
    if (!this.context || !this.music) return;
    const time = this.context.currentTime;
    this.music.gain.cancelScheduledValues(time);
    this.music.gain.setTargetAtTime(level, time, ease);
  }

  private finishMusic(): void {
    this.ending = true;
    this.setMusicLevel(0.035, 0.32);
  }
}
