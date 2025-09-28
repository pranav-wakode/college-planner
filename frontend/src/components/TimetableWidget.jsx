import React, { useState, useEffect, useRef } from 'react';
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

const parseTime = (timeStr) => {
  const [time, modifier] = timeStr.trim().split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier) {
    const isPM = modifier.toLowerCase().startsWith('p');
    if (isPM && hours < 12) {
      hours += 12;
    }
    const isAM = modifier.toLowerCase().startsWith('a');
    if (isAM && hours === 12) {
      hours = 0;
    }
  }
  return hours + (minutes || 0) / 60;
};

const parseTimeRange = (rangeStr) => {
  const parts = rangeStr.split('-');
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
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContext, setEditingContext] = useState(null);
  const [currentHallNo, setCurrentHallNo] = useState('');
  const dialogContentRef = useRef(null);

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
        setLocalData({ timetable, syllabus, hallNumbers, timeSlots });
      }
    };
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [standalone, timetable, syllabus, hallNumbers, timeSlots]);

  const handleSlotClick = (day, timeSlot, subject) => {
    if (subject && subject !== 'Lunch Break' && subject !== 'Free Period') {
      setEditingContext({ day, timeSlot, subject });
      setCurrentHallNo(localData.hallNumbers[day]?.[timeSlot] || '');
      setIsDialogOpen(true);
    }
  };

  const handleDialogChange = (open) => {
    setIsDialogOpen(open);
    if (open) {
      setTimeout(() => {
        dialogContentRef.current?.focus();
      }, 50);
    }
  };

  const handleHallNumberUpdate = async () => {
    if (!editingContext) return;
    const { day, timeSlot } = editingContext;
    const newHallNumbers = JSON.parse(JSON.stringify(localData.hallNumbers));
    if (!newHallNumbers[day]) newHallNumbers[day] = {};
    newHallNumbers[day][timeSlot] = currentHallNo;
    if (onHallNumbersChange) {
      onHallNumbersChange(newHallNumbers);
    } else {
      setLocalData(prev => ({ ...prev, hallNumbers: newHallNumbers }));
      await saveHallNumbersToStorage(newHallNumbers);
    }
  };

  const handleHallNumberDelete = async () => {
    if (!editingContext) return;
    const { day, timeSlot } = editingContext;
    const newHallNumbers = JSON.parse(JSON.stringify(localData.hallNumbers));
    if (newHallNumbers[day]?.[timeSlot]) delete newHallNumbers[day][timeSlot];
    if (onHallNumbersChange) {
      onHallNumbersChange(newHallNumbers);
    } else {
      setLocalData(prev => ({ ...prev, hallNumbers: newHallNumbers }));
      await saveHallNumbersToStorage(newHallNumbers);
    }
    setCurrentHallNo('');
  };

  const getCurrentDay = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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

  const getSubjectStyle = (subject) => {
    if (subject === 'Lunch Break') return 'bg-orange-100 text-orange-800';
    if (subject === 'Free Period') return 'bg-gray-100 text-gray-600';
    return 'bg-blue-50 text-blue-800 hover:bg-blue-100';
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

        {/* FIX: Added max-height and overflow-y-auto to this container */}
        <CardContent className="space-y-2 pt-2 max-h-[65vh] overflow-y-auto pr-2">
          {localData.timeSlots.map(timeSlot => {
            const subject = todaySchedule[timeSlot] || 'Free Period';
            const hallNo = localData.hallNumbers[currentDay]?.[timeSlot];
            const isCurrentSlot = timeSlot === currentTimeSlot;

            return (
              <div
                key={timeSlot}
                onClick={() => handleSlotClick(currentDay, timeSlot, subject)}
                className={`relative p-3 rounded-lg transition-all duration-200 cursor-pointer ${getSubjectStyle(subject)} ${isCurrentSlot ? 'ring-2 ring-green-500' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold text-sm truncate pr-10 ${isCurrentSlot ? 'font-bold' : ''}`}>{subject}</span>
                  {isCurrentSlot && (
                    <Badge
                      variant="default"
                      className="absolute top-8 right-6 text-xs bg-green-600"
                    >
                      NOW
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{timeSlot}</p>

                {hallNo && (
                  <span className="absolute top-3 right-3 transform translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-blue-600 text-white text-xs font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                    {hallNo}
                  </span>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogContent ref={dialogContentRef} tabIndex={-1} className="sm:max-w-md h-[90vh] sm:h-[80vh] flex flex-col focus:outline-none">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-blue-600" /> {editingContext?.subject}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-2 flex-shrink-0">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700"><Home className="w-4 h-4" /> Hall / Room No. for this slot</label>
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
            <div className="border-t pt-4 mt-2 flex flex-col flex-grow overflow-hidden">
              <h3 className="font-medium text-gray-800 mb-2 flex-shrink-0">Syllabus for {editingContext?.subject}</h3>
              <div className="flex-grow overflow-y-auto pr-2">
                <div className="space-y-3">
                  {(localData.syllabus[editingContext?.subject]?.length > 0) ? (
                    localData.syllabus[editingContext?.subject].map((topic, index) => (
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
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default TimetableWidget;