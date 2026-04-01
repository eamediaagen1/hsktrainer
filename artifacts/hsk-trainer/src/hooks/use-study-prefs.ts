import { useState, useEffect } from "react";

const STORAGE_KEY = "hsk_study_prefs";

interface StudyPrefs {
  showPinyin: boolean;
  autoPlay: boolean;
  lastLevel: number;
}

const DEFAULTS: StudyPrefs = {
  showPinyin: true,
  autoPlay: false,
  lastLevel: 1,
};

function load(): StudyPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function save(prefs: StudyPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // storage full — silently ignore
  }
}

export function useStudyPrefs() {
  const [prefs, setPrefs] = useState<StudyPrefs>(load);

  useEffect(() => {
    save(prefs);
  }, [prefs]);

  const set = <K extends keyof StudyPrefs>(key: K, value: StudyPrefs[K]) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  };

  return { prefs, set };
}
