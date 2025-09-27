import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Clock, BookOpen, Calendar, ExternalLink, Home, Trash2, Save } from 'lucide-react';
import { mockTimeSlots as defaultTimeSlots } from '../mock';
import {
  loadTimetableFromStorage,
  loadSyllabusFromStorage,
  loadTimeSlotsFromStorage,
  loadHallNumbersFromStorage,
  saveHallNumbersToStorage
} from '../utils/storage';

// Helper functions (unchanged)
const parseTime = (timeStr) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier) {
    if (modifier.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
  }
  return hours + (minutes || 0) / 60;
};
const parseTimeRange = (rangeStr) => {
  const parts = rangeStr.split('-').map(s => s.trim().replace(" AM", "").replace(" PM", ""));
  if (parts.length !== 2) return { start: 0, end: 0 };
  const start = parseTime(parts[0]);
  const end = parseTime(parts[1]);
  return { start, end };
};

const TimetableWidget = ({
  standalone = false,
  timeSlots = defaultTimeSlots,
  timetable = {},
  syllabus = {},
  hallNumbers = {},
  onHallNumbersChange
}) => {
  const [localData, setLocalData] = useState({ timetable, syllabus, hallNumbers, timeSlots });
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [currentHallNo, setCurrentHallNo] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Effect for standalone mode OR when props update
  useEffect(() => {
    const loadData = async () => {
      if (standalone) {
        setLocalData({
            timetable: await loadTimetableFromStorage(),
            syllabus: await loadSyllabusFromStorage(),
            timeSlots: await loadTimeSlotsFromStorage(),
            hallNumbers: await loadHallNumbersFromStorage(),
        });
      } else {
        // When used as a preview, always sync with props from Dashboard
        setLocalData({ timetable, syllabus, hallNumbers, timeSlots });
      }
    };
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [standalone, timetable, syllabus, hallNumbers, timeSlots]);

  const handleHallNumberUpdate = async () => {
    const newHallNumbers = { ...localData.hallNumbers, [selectedSubject]: currentHallNo };
    if (onHallNumbersChange) {
      onHallNumbersChange(newHallNumbers);
    } else {
      setLocalData(prev => ({ ...prev, hallNumbers: newHallNumbers }));
      await saveHallNumbersToStorage(newHallNumbers);
    }
  };

  const handleHallNumberDelete = async () => {
    const newHallNumbers = { ...localData.hallNumbers };
    delete newHallNumbers[selectedSubject];
    if (onHallNumbersChange) {
      onHallNumbersChange(newHallNumbers);
    } else {
      setLocalData(prev => ({ ...prev, hallNumbers: newHallNumbers }));
      await saveHallNumbersToStorage(newHallNumbers);
    }
    setCurrentHallNo('');
  };

  const handleSubjectClick = (subject) => {
    if (subject && subject !== 'Lunch Break' && subject !== 'Free Period') {
      setSelectedSubject(subject);
      setCurrentHallNo(localData.hallNumbers[subject] || '');
    }
  };

  // FIX: This function now returns the correct 3-letter day abbreviation.
  const getCurrentDay = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // In preview, always show Monday if today is Sunday
    const dayIndex = new Date().getDay();
    if (!standalone && dayIndex === 0) return 'Mon';
    return days[dayIndex];
  };

  const getCurrentTimeSlot = () => {
    const now = currentTime.getHours() + currentTime.getMinutes() / 60;
    for (const slot of localData.timeSlots) {
      const { start, end } = parseTimeRange(slot);
      if (now >= start && now < end) return slot;
    }
    return null;
  };

  const getSubjectStyle = (subject, isCurrent) => {
    let baseStyle = 'p-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer';
    if (subject === 'Lunch Break') baseStyle += ' bg-orange-100 text-orange-800';
    else if (subject === 'Free Period') baseStyle += ' bg-gray-100 text-gray-600';
    else baseStyle += ' bg-blue-50 text-blue-800 hover:bg-blue-100';
    if (isCurrent) baseStyle += ' ring-2 ring-green-500';
    return baseStyle;
  };

  const currentDay = getCurrentDay();
  const currentTimeSlot = getCurrentTimeSlot();
  const todaySchedule = localData.timetable[currentDay] || {};

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
          {localData.timeSlots.map(timeSlot => {
            const subject = todaySchedule[timeSlot] || 'Free Period';
            const hallNo = localData.hallNumbers[subject];
            const isCurrentSlot = timeSlot === currentTimeSlot;
            return (
              <div key={timeSlot} className={getSubjectStyle(subject, isCurrentSlot)} onClick={() => handleSubjectClick(subject)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-gray-500 w-24 text-right flex-shrink-0">{timeSlot}</span>
                    <span className={`font-medium truncate ${isCurrentSlot ? 'font-bold' : ''}`}>{subject}</span>
                    {hallNo && <Badge variant="outline" className="flex-shrink-0">Hall: {hallNo}</Badge>}
                  </div>
                  {isCurrentSlot && <Badge variant="default" className="text-xs bg-green-600 flex-shrink-0">NOW</Badge>}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {selectedSubject && (
        <Dialog open={!!selectedSubject} onOpenChange={() => setSelectedSubject(null)}>
            {/* The Dialog content remains the same as your provided version */}
            <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-blue-600" /> {selectedSubject}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700"><Home className="w-4 h-4" /> Hall / Room No.</label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="e.g., 101 or Lab A"
                  value={currentHallNo}
                  onChange={(e) => setCurrentHallNo(e.target.value)}
                />
                <Button size="icon" onClick={handleHallNumberUpdate}><Save className="w-4 h-4" /></Button>
                <Button size="icon" variant="destructive" onClick={handleHallNumberDelete}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="border-t pt-4 mt-2 flex-grow overflow-hidden">
              <h3 className="font-medium text-gray-800 mb-2">Syllabus</h3>
              <ScrollArea className="h-full pr-4 -mr-4">
                <div className="space-y-3">
                  {(localData.syllabus[selectedSubject]?.length > 0) ? (
                    localData.syllabus[selectedSubject].map((topic, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">{index + 1}</div>
                        <p className="text-sm text-gray-700 leading-relaxed">{topic}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No syllabus topics found.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TimetableWidget;