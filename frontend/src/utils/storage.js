// src/utils/storage.js

import { mockSyllabus, mockTimeSlots, mockTimetable } from '../mock';

// General purpose getters and setters
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
  }
};

const loadFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Failed to load ${key}:`, error);
    return defaultValue;
  }
};

// --- App Data Functions ---

export const saveTimetableToStorage = (timetable) => saveToStorage('timetable_data', timetable);
export const loadTimetableFromStorage = () => loadFromStorage('timetable_data', mockTimetable);

export const saveSyllabusToStorage = (syllabus) => saveToStorage('syllabus_data', syllabus);
export const loadSyllabusFromStorage = () => loadFromStorage('syllabus_data', mockSyllabus);

export const saveSubjectsToStorage = (subjects) => saveToStorage('subjects_list', subjects);
export const loadSubjectsFromStorage = () => loadFromStorage('subjects_list', []);

export const saveTimeSlotsToStorage = (slots) => saveToStorage('timetable_slots', slots);
export const loadTimeSlotsFromStorage = () => loadFromStorage('timetable_slots', mockTimeSlots);

// New functions for Hall Numbers
export const saveHallNumbersToStorage = (hallNumbers) => saveToStorage('hall_numbers', hallNumbers);
export const loadHallNumbersFromStorage = () => loadFromStorage('hall_numbers', {});