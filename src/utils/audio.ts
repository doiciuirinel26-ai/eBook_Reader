/**
 * Synthesizes a realistic paper/page rustling sound effect using the Web Audio API. This avoids any 404 risks for mp3 files.
 */
export function playPageTurnSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    
    // 1. Create a White Noise Buffer
    const bufferSize = ctx.sampleRate * 0.45; // 450ms duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    // 2. Instantiate Noise Source
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // 3. Bandpass Filter (captures the high-frequency paper scratch sound)
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.setValueAtTime(4.0, ctx.currentTime);
    // Dynamic frequency sweep to model the page moving through air
    bandpass.frequency.setValueAtTime(1400, ctx.currentTime);
    bandpass.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    bandpass.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.45);

    // 4. Volume Envelope (starts quick, peaks, scrapes, fades out)
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.05); // quick rub
    gainNode.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.15); // scrape
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45); // fade out

    // 5. Connect and Play
    noiseSource.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start();
    noiseSource.stop(ctx.currentTime + 0.45);
  } catch (error) {
    // Fail silently if browser audio features are blocked by policy or un-initialized
    console.warn('Paper audio synthesis blocked or not supported on this browser context.');
  }
}
