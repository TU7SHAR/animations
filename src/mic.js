let analyser = null;
let dataArray = null;

export async function initMic() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    analyser = audioContext.createAnalyser();

    analyser.fftSize = 32;

    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    console.log("Mic Successfully initialised");
  } catch (err) {
    console.error("Microphone Access Denied!", err);
  }
}

export function getAudioData() {
  if (!analyser || !dataArray) return 0;
  analyser.getByteFrequencyData(dataArray);

  let sum = 0;
  for (let i = 0; i < dataArray.length; ++i) sum += dataArray[i];

  const average = sum / dataArray.length;

  return average / 255;
}
