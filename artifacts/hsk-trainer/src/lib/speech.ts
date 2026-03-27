/**
 * Speak a Chinese word using the browser SpeechSynthesis API.
 * Only reads the Chinese character — never pinyin — to avoid double-speak.
 * Adds a 50ms delay after cancel() to flush queued utterances before speaking.
 */
export function speakChinese(chineseText: string): boolean {
  if (!("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  // Small delay ensures cancel() is fully flushed before the new utterance
  // is queued, preventing the double-speak bug in Chrome and Safari.
  setTimeout(() => {
    const utt = new SpeechSynthesisUtterance(chineseText);
    utt.lang = "zh-CN";
    utt.rate = 0.85;
    window.speechSynthesis.speak(utt);
  }, 50);
  return true;
}
