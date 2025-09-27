import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Calendar, BookOpen, Grid3X3, Clock, GraduationCap, ExternalLink, Smartphone, BookCopy } from 'lucide-react';
import TimetableGrid from './TimetableGrid';
import SyllabusManager from './SyllabusManager';
import SubjectsManager from './SubjectsManager';
import TimetableWidget from './TimetableWidget';
import DataSyncManager from './DataSyncManager';
import { mockTimeSlots } from '../mock';
import {
  loadTimetableFromStorage, saveTimetableToStorage,
  loadTimeSlotsFromStorage, saveTimeSlotsToStorage,
  loadSyllabusFromStorage, saveSyllabusToStorage,
  loadSubjectsFromStorage, saveSubjectsToStorage,
  loadHallNumbersFromStorage, saveHallNumbersToStorage
} from '../utils/storage';

const Dashboard = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [activeTab, setActiveTab] = useState('timetable');
  const [showWidgetPreview, setShowWidgetPreview] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [timeSlots, setTimeSlots] = useState([]);
  const [timetable, setTimetable] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [syllabus, setSyllabus] = useState({});
  const [hallNumbers, setHallNumbers] = useState({});

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 60000);
    const loadData = async () => {
      setTimeSlots(await loadTimeSlotsFromStorage());
      // FIX: Corrected typo from loadTimetableFromstorage to loadTimetableFromStorage
      setTimetable(await loadTimetableFromStorage());
      setSubjects(await loadSubjectsFromStorage());
      setSyllabus(await loadSyllabusFromStorage());
      setHallNumbers(await loadHallNumbersFromStorage());
    };
    loadData();
    return () => clearInterval(timerId);
  }, []);

  const stats = useMemo(() => {
    let classCount = 0;
    Object.values(timetable).forEach(daySchedule => {
      Object.values(daySchedule).forEach(subject => {
        if (subject && subject !== 'Free Period' && subject !== 'Lunch Break') {
          classCount++;
        }
      });
    });
    return {
      activeSubjectsCount: subjects.length,
      weeklyClassesCount: classCount
    };
  }, [timetable, subjects]);

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
  const handleSyllabusChange = async (newSyllabus) => {
    setSyllabus(newSyllabus);
    await saveSyllabusToStorage(newSyllabus);
  };
  const handleSubjectsChange = async (newSubjects) => {
    setSubjects(newSubjects);
    await saveSubjectsToStorage(newSubjects);
  };
  const handleHallNumbersChange = async (newHallNumbers) => {
    setHallNumbers(newHallNumbers);
    await saveHallNumbersToStorage(newHallNumbers);
  };

  const handleAddSubject = async (subjectName) => {
    if (subjects.find(s => s.toLowerCase() === subjectName.toLowerCase())) {
      alert('Subject already exists!');
      return;
    }
    const newSubjects = [...subjects, subjectName].sort();
    await handleSubjectsChange(newSubjects);
    if (!syllabus[subjectName]) {
      const newSyllabus = { ...syllabus, [subjectName]: [] };
      await handleSyllabusChange(newSyllabus);
    }
  };

  const handleDeleteSubject = async (subjectToDelete) => {
    const newSubjects = subjects.filter(s => s !== subjectToDelete);
    await handleSubjectsChange(newSubjects);

    const newTimetable = JSON.parse(JSON.stringify(timetable));
    Object.keys(newTimetable).forEach(day => {
      Object.keys(newTimetable[day]).forEach(timeSlot => {
        if (newTimetable[day][timeSlot] === subjectToDelete) {
          newTimetable[day][timeSlot] = 'Free Period';
        }
      });
    });
    await handleTimetableChange(newTimetable);

    const newSyllabus = { ...syllabus };
    delete newSyllabus[subjectToDelete];
    await handleSyllabusChange(newSyllabus);

    const newHallNumbers = { ...hallNumbers };
    delete newHallNumbers[subjectToDelete];
    await handleHallNumbersChange(newHallNumbers);
  };

  const handleImportData = async (data) => {
    await handleSubjectsChange(data.subjects || []);
    await handleTimetableChange(data.timetable || {});
    await handleSyllabusChange(data.syllabus || {});
    await handleTimeSlotsChange(data.timeSlots || mockTimeSlots);
    await handleHallNumbersChange(data.hallNumbers || {});
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
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid lg:grid-cols-3">
            <TabsTrigger value="timetable" className="flex items-center gap-2"><Grid3X3 className="w-4 h-4" />Timetable</TabsTrigger>
            <TabsTrigger value="syllabus" className="flex items-center gap-2"><BookOpen className="w-4 h-4" />Syllabus</TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center gap-2"><BookCopy className="w-4 h-4" />Subjects</TabsTrigger>
          </TabsList>

          <TabsContent value="timetable" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"><CardContent className="p-6 flex items-center justify-between"><div><p className="text-blue-100">Current Day</p><p className="text-2xl font-bold">{currentDay}</p></div><Calendar className="w-8 h-8 text-blue-200" /></CardContent></Card>
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"><CardContent className="p-6 flex items-center justify-between"><div><p className="text-purple-100">Active Subjects</p><p className="text-2xl font-bold">{stats.activeSubjectsCount}</p></div><BookOpen className="w-8 h-8 text-purple-200" /></CardContent></Card>
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white"><CardContent className="p-6 flex items-center justify-between"><div><p className="text-green-100">Weekly Classes</p><p className="text-2xl font-bold">{stats.weeklyClassesCount}</p></div><Clock className="w-8 h-8 text-green-200" /></CardContent></Card>
            </div>

            <TimetableGrid
              onSubjectClick={handleSubjectClick}
              timeSlots={timeSlots}
              timetable={timetable}
              onTimeSlotsChange={handleTimeSlotsChange}
              onTimetableChange={handleTimetableChange}
              subjects={subjects}
            />

            <Card className="bg-indigo-50 border-indigo-200"><CardContent className="p-6"><div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-indigo-800 flex items-center gap-2"><Smartphone className="w-5 h-5" />Widget Access</h3><Button size="sm" onClick={openWidgetInNewWindow} className="bg-indigo-600 hover:bg-indigo-700"><ExternalLink className="w-4 h-4 mr-1" />Open in New Window</Button></div><p className="text-sm text-indigo-700">• Use the widget for a compact view of your daily schedule.</p></CardContent></Card>

            <DataSyncManager
              data={{ subjects, timetable, syllabus, timeSlots, hallNumbers }}
              onImport={handleImportData}
            />
          </TabsContent>

          <TabsContent value="syllabus" className="space-y-6">
            <SyllabusManager
              subjects={subjects}
              syllabusData={syllabus}
              onSyllabusChange={handleSyllabusChange}
            />
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <SubjectsManager
              subjects={subjects}
              onAddSubject={handleAddSubject}
              onDeleteSubject={handleDeleteSubject}
            />
          </TabsContent>
        </Tabs>

        {selectedSubject && <SyllabusManager selectedSubject={selectedSubject} onClose={() => setSelectedSubject(null)} subjects={subjects} syllabusData={syllabus} onSyllabusChange={handleSyllabusChange} />}

        <Dialog open={showWidgetPreview} onOpenChange={setShowWidgetPreview}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Widget Preview</DialogTitle></DialogHeader>
            <div className="p-4 bg-gray-50 rounded-lg">
              <TimetableWidget
                timeSlots={timeSlots}
                timetable={timetable}
                syllabus={syllabus}
                hallNumbers={hallNumbers}
                onHallNumbersChange={handleHallNumbersChange}
                key={JSON.stringify({ timeSlots, timetable, hallNumbers, syllabus })}
              />
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 mt-16"><div className="max-w-7xl mx-auto text-center py-6 px-4"><p className="text-sm text-gray-500">Made by Pranav Wakode</p></div></footer>
    </div>
  );
};
export default Dashboard;