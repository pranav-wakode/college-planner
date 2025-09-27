import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Calendar, BookOpen, Grid3X3, Clock, GraduationCap, ExternalLink, Smartphone } from 'lucide-react';
import TimetableGrid from './TimetableGrid';
import SyllabusManager from './SyllabusManager';
import TimetableWidget from './TimetableWidget';
import { mockTimeSlots } from '../mock';
import { loadTimetableFromStorage, saveTimetableToStorage } from '../utils/storage';

const saveTimeSlotsToStorage = async (slots) => {
  try {
    localStorage.setItem('timetable_slots', JSON.stringify(slots));
  } catch (error) { console.error("Failed to save time slots:", error); }
};

const loadTimeSlotsFromStorage = async () => {
  try {
    const savedSlots = localStorage.getItem('timetable_slots');
    return savedSlots ? JSON.parse(savedSlots) : null;
  } catch (error) { console.error("Failed to load time slots:", error); return null; }
};

const Dashboard = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [activeTab, setActiveTab] = useState('timetable');
  const [showWidgetPreview, setShowWidgetPreview] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- FIX: Both timetable grid data and time slots are now managed here ---
  const [timeSlots, setTimeSlots] = useState(mockTimeSlots);
  const [timetable, setTimetable] = useState({});

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 60000);
    const loadData = async () => {
      const savedTimeSlots = await loadTimeSlotsFromStorage();
      if (savedTimeSlots) setTimeSlots(savedTimeSlots);

      const savedTimetable = await loadTimetableFromStorage();
      if (savedTimetable) setTimetable(savedTimetable);
    };
    loadData();
    return () => clearInterval(timerId);
  }, []);

  // --- FIX: Calculate stats dynamically whenever the timetable changes ---
  const stats = useMemo(() => {
    const subjects = new Set();
    let classCount = 0;
    if (timetable) {
      Object.values(timetable).forEach(daySchedule => {
        Object.values(daySchedule).forEach(subject => {
          if (subject && subject !== 'Free Period' && subject !== 'Lunch Break') {
            subjects.add(subject);
            classCount++;
          }
        });
      });
    }
    return {
      activeSubjectsCount: subjects.size,
      weeklyClassesCount: classCount
    };
  }, [timetable]);

  const handleSubjectClick = (subject) => setSelectedSubject(subject);
  const openWidgetInNewWindow = () => window.open('/widget', 'timetableWidget', 'width=400,height=600,scrollbars=yes,resizable=yes');

  const handleTimeSlotsChange = async (newTimeSlots) => {
    setTimeSlots(newTimeSlots);
    await saveTimeSlotsToStorage(newTimeSlots);
  };

  const handleTimetableChange = async (newTimetable) => {
    setTimetable(newTimetable);
    await saveTimetableToStorage(newTimetable);
  };

  const getCurrentDaySchedule = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    const displayDay = today === 'Sunday' ? 'Monday' : today;
    return { day: displayDay, isToday: today !== 'Sunday' };
  };
  const { day: currentDay, isToday } = getCurrentDaySchedule();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"><div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div className="flex items-center space-x-3"><div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl"><GraduationCap className="w-8 h-8 text-white" /></div><div><h1 className="text-2xl sm:text-3xl font-bold text-gray-900">College Planner</h1><p className="text-gray-600">Timetable & Syllabus Manager</p></div></div><div className="flex items-center space-x-2 w-full sm:w-auto"><Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 py-2 px-3"><Clock className="w-4 h-4 mr-2" />{isToday ? 'Today' : 'Demo'}: {currentDay}</Badge><Button variant="outline" size="sm" onClick={() => setShowWidgetPreview(true)} className="flex-1 sm:flex-none"><Smartphone className="w-4 h-4 mr-2" />Preview</Button></div></div></div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid lg:grid-cols-2"><TabsTrigger value="timetable" className="flex items-center gap-2"><Grid3X3 className="w-4 h-4" />Timetable</TabsTrigger><TabsTrigger value="syllabus" className="flex items-center gap-2"><BookOpen className="w-4 h-4" />Syllabus</TabsTrigger></TabsList>
          <TabsContent value="timetable" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"><CardContent className="p-6 flex items-center justify-between"><div><p className="text-blue-100">Current Day</p><p className="text-2xl font-bold">{currentDay}</p></div><Calendar className="w-8 h-8 text-blue-200" /></CardContent></Card>
              {/* --- FIX: Displaying dynamic stats --- */}
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"><CardContent className="p-6 flex items-center justify-between"><div><p className="text-purple-100">Active Subjects</p><p className="text-2xl font-bold">{stats.activeSubjectsCount}</p></div><BookOpen className="w-8 h-8 text-purple-200" /></CardContent></Card>
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white"><CardContent className="p-6 flex items-center justify-between"><div><p className="text-green-100">Weekly Classes</p><p className="text-2xl font-bold">{stats.weeklyClassesCount}</p></div><Clock className="w-8 h-8 text-green-200" /></CardContent></Card>
            </div>

            <TimetableGrid
              onSubjectClick={handleSubjectClick}
              timeSlots={timeSlots}
              timetable={timetable}
              onTimeSlotsChange={handleTimeSlotsChange}
              onTimetableChange={handleTimetableChange}
            />

            <Card className="bg-indigo-50 border-indigo-200"><CardContent className="p-6"><div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-indigo-800 flex items-center gap-2"><Smartphone className="w-5 h-5" />Widget Access</h3><Button size="sm" onClick={openWidgetInNewWindow} className="bg-indigo-600 hover:bg-indigo-700"><ExternalLink className="w-4 h-4 mr-1" />Open in New Window</Button></div><p className="text-sm text-indigo-700">• Use the widget for a compact view of your daily schedule.</p></CardContent></Card>
          </TabsContent>
          <TabsContent value="syllabus" className="space-y-6"><SyllabusManager /></TabsContent>
        </Tabs>

        {selectedSubject && <SyllabusManager selectedSubject={selectedSubject} onClose={() => setSelectedSubject(null)} />}

        <Dialog open={showWidgetPreview} onOpenChange={setShowWidgetPreview}>
          <DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Widget Preview</DialogTitle></DialogHeader><div className="p-4 bg-gray-50 rounded-lg"><TimetableWidget timeSlots={timeSlots} key={`${currentTime.getMinutes()}-${JSON.stringify(timeSlots)}`}/></div></DialogContent>
        </Dialog>
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 mt-16"><div className="max-w-7xl mx-auto text-center py-6 px-4"><p className="text-sm text-gray-500">Made by Pranav Wakode</p></div></footer>
    </div>
  );
};
export default Dashboard;