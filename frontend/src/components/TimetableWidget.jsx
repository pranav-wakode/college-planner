import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Clock, BookOpen, Calendar, ExternalLink } from 'lucide-react';
import { mockTimeSlots as defaultTimeSlots } from '../mock';
import { loadTimetableFromStorage, loadSyllabusFromStorage } from '../utils/storage';

const loadTimeSlotsFromStorage = async () => {
  try {
    const savedSlots = localStorage.getItem('timetable_slots');
    return savedSlots ? JSON.parse(savedSlots) : null;
  } catch (error) {
    console.error("Failed to load time slots:", error);
    return null;
  }
};

const parseTime = (timeStr) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier) {
    if (modifier.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
  } else {
    if (hours >= 1 && hours <= 7) {
      hours += 12;
    }
  }
  return hours + (minutes || 0) / 60;
};

const parseTimeRange = (rangeStr) => {
  const parts = rangeStr.split('-').map(s => s.trim());
  if (parts.length !== 2) return { start: 0, end: 0 };
  const start = parseTime(parts[0]);
  const end = parseTime(parts[1]);
  return { start, end };
};

const TimetableWidget = ({ standalone = false, timeSlots: timeSlotsProp }) => {
  const [timetable, setTimetable] = useState({});
  const [syllabusData, setSyllabusData] = useState({});
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState(timeSlotsProp || defaultTimeSlots);

  useEffect(() => {
    const loadData = async () => {
      const timetableData = await loadTimetableFromStorage();
      const syllabusDataLoaded = await loadSyllabusFromStorage();
      setTimetable(timetableData || {});
      setSyllabusData(syllabusDataLoaded || {});
      if (standalone && !timeSlotsProp) {
        const savedTimeSlots = await loadTimeSlotsFromStorage();
        setTimeSlots(savedTimeSlots || defaultTimeSlots);
      }
    };
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [standalone, timeSlotsProp]);

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()] || 'Monday';
  };

  const getCurrentTimeSlot = () => {
    const now = currentTime.getHours() + currentTime.getMinutes() / 60;
    for (const slot of timeSlots) {
      const { start, end } = parseTimeRange(slot);
      if (now >= start && now < end) {
        return slot;
      }
    }
    return null;
  };

  // --- FIX: Updated style function to handle colors based on subject name ---
  const getSubjectStyle = (subject, isCurrent) => {
    let baseStyle = 'p-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer';

    if (subject === 'Lunch Break') {
      baseStyle += ' bg-orange-100 text-orange-800';
    } else if (subject === 'Free Period') {
      baseStyle += ' bg-gray-100 text-gray-600';
    } else {
      // Default color for all other subjects
      baseStyle += ' bg-blue-50 text-blue-800 hover:bg-blue-100';
    }

    if (isCurrent) {
      // Highlighting for the current slot
      baseStyle += ' ring-2 ring-green-500';
    }
    return baseStyle;
  };

  const currentDay = getCurrentDay();
  const currentTimeSlot = getCurrentTimeSlot();
  const todaySchedule = timetable[currentDay] || {};

  const handleSubjectClick = (subject) => {
    if (subject && subject !== 'Lunch Break' && subject !== 'Free Period') setSelectedSubject(subject);
  };

  return (
    <div className={`${standalone ? 'min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4' : ''}`}>
      <Card className={`w-full max-w-md ${standalone ? 'mx-auto' : ''} shadow-lg`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> Today's Schedule
            </CardTitle>
            {standalone && <Button size="sm" variant="outline" onClick={() => window.open('/', '_blank')}><ExternalLink className="w-4 h-4" /></Button>}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" /> <span>{currentDay}</span>
            <Badge variant="secondary" className="text-xs">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {timeSlots.map(timeSlot => {
            const subject = todaySchedule[timeSlot] || 'Free Period';
            const isCurrentSlot = timeSlot === currentTimeSlot;
            return (
              // --- FIX: The className is now fully determined by the style function ---
              <div key={timeSlot} className={getSubjectStyle(subject, isCurrentSlot)} onClick={() => handleSubjectClick(subject)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 w-[90px] text-right">{timeSlot}</span>
                    <span className={`font-medium ${isCurrentSlot ? 'font-bold' : ''}`}>{subject}</span>
                  </div>
                  {isCurrentSlot && <Badge variant="default" className="text-xs bg-green-600">NOW</Badge>}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {selectedSubject && (
        <Dialog open={!!selectedSubject} onOpenChange={() => setSelectedSubject(null)}>
          <DialogContent className="sm:max-w-md max-h-[70vh]"><DialogHeader><DialogTitle className="flex items-center gap-2 text-lg"><BookOpen className="w-5 h-5 text-blue-600" />{selectedSubject} Syllabus</DialogTitle></DialogHeader><ScrollArea className="max-h-[50vh]"><div className="space-y-3">{syllabusData[selectedSubject]?.length > 0 ? (syllabusData[selectedSubject].map((topic, index) => (<div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"><div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">{index + 1}</div><p className="text-sm text-gray-700 leading-relaxed">{topic}</p></div>))) : (<div className="text-center py-6 text-gray-500"><BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">No syllabus topics</p></div>)}</div></ScrollArea></DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TimetableWidget;