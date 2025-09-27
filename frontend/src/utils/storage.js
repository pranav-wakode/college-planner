import { Preferences } from '@capacitor/preferences';
// Make sure to import mock data used for defaults
import { mockTimetable, mockSyllabus, mockTimeSlots } from '../mock';

// Check if we're running in a Capacitor environment
const isNativeApp = () => {
  return window?.Capacitor?.isNativePlatform?.() || false;
};

// Native storage functions
const setNativeStorage = async (key, value) => {
  try {
    await Preferences.set({
      key,
      value: JSON.stringify(value),
    });
  } catch (error) {
    console.error('Error saving to native storage:', error);
    // Fallback to localStorage
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const getNativeStorage = async (key, defaultValue) => {
  try {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error('Error reading from native storage:', error);
    // Fallback to localStorage
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  }
};

// Web storage functions (fallback)
const setWebStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getWebStorage = (key, defaultValue) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

// --- Timetable Storage ---
export const saveTimetableToStorage = async (timetable) => {
  if (isNativeApp()) {
    await setNativeStorage('collegeTimetable', timetable);
  } else {
    setWebStorage('collegeTimetable', timetable);
  }
};

export const loadTimetableFromStorage = async () => {
  if (isNativeApp()) {
    return await getNativeStorage('collegeTimetable', mockTimetable);
  } else {
    return getWebStorage('collegeTimetable', mockTimetable);
  }
};

// --- Syllabus Storage ---
export const saveSyllabusToStorage = async (syllabus) => {
  if (isNativeApp()) {
    await setNativeStorage('collegeSyllabus', syllabus);
  } else {
    setWebStorage('collegeSyllabus', syllabus);
  }
};

export const loadSyllabusFromStorage = async () => {
  if (isNativeApp()) {
    return await getNativeStorage('collegeSyllabus', mockSyllabus);
  } else {
    return getWebStorage('collegeSyllabus', mockSyllabus);
  }
};

// --- Subjects Storage (New) ---
export const saveSubjectsToStorage = async (subjects) => {
  if (isNativeApp()) {
    await setNativeStorage('subjects_list', subjects);
  } else {
    setWebStorage('subjects_list', subjects);
  }
};

export const loadSubjectsFromStorage = async () => {
  // Default to an empty array as subjects are user-defined
  if (isNativeApp()) {
    return await getNativeStorage('subjects_list', []);
  } else {
    return getWebStorage('subjects_list', []);
  }
};

// --- Time Slots Storage (New) ---
export const saveTimeSlotsToStorage = async (slots) => {
  if (isNativeApp()) {
    await setNativeStorage('timetable_slots', slots);
  } else {
    setWebStorage('timetable_slots', slots);
  }
};

export const loadTimeSlotsFromStorage = async () => {
  if (isNativeApp()) {
    return await getNativeStorage('timetable_slots', mockTimeSlots);
  } else {
    return getWebStorage('timetable_slots', mockTimeSlots);
  }
};


// Initialize app data
export const initializeAppData = async () => {
  try {
    // Check if data exists, if not, create initial data
    const timetable = await loadTimetableFromStorage();
    const syllabus = await loadSyllabusFromStorage();

    if (!timetable || Object.keys(timetable).length === 0) {
      await saveTimetableToStorage(mockTimetable);
    }

    if (!syllabus || Object.keys(syllabus).length === 0) {
      await saveSyllabusToStorage(mockSyllabus);
    }

    return { timetable, syllabus };
  } catch (error)
 {
    console.error('Error initializing app data:', error);
    return { timetable: mockTimetable, syllabus: mockSyllabus };
  }
};