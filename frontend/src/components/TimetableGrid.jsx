import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, Edit3, Save, X, Clock, Edit2, Trash2 } from 'lucide-react';
import { mockDays, mockSubjects } from '../mock';

const TimetableGrid = ({ onSubjectClick, timeSlots, timetable, onTimeSlotsChange, onTimetableChange }) => {
  const [editMode, setEditMode] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [customSubject, setCustomSubject] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState(null);
  const [tempTimeSlotText, setTempTimeSlotText] = useState('');
  const [format, setFormat] = useState(() => {
    // Retrieve saved format from localStorage, default to '1' if not set
    return localStorage.getItem('timetableFormat') || '1';
  });

  // Save format to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('timetableFormat', format);
  }, [format]);

  const handleCellClick = (day, timeSlot) => {
    if (!editMode) {
      const subject = timetable[day]?.[timeSlot];
      if (subject && subject !== 'Lunch Break' && subject !== 'Free Period') onSubjectClick(subject);
      return;
    }
    setEditingCell({ day, timeSlot });
    setShowCustomInput(false);
  };

  const handleSubjectSelect = async (subject) => {
    if (!editingCell) return;
    const { day, timeSlot } = editingCell;
    const newTimetable = { ...timetable, [day]: { ...(timetable[day] || {}), [timeSlot]: subject } };
    onTimetableChange(newTimetable);
    setEditingCell(null);
  };

  const handleCustomSubjectAdd = async () => {
    if (!customSubject.trim() || !editingCell) return;
    await handleSubjectSelect(customSubject.trim());
    setCustomSubject('');
    setShowCustomInput(false);
  };

  const handleTimeSlotSave = async () => {
    if (!editingTimeSlot) return;
    const newTimeSlots = [...timeSlots];
    newTimeSlots[editingTimeSlot.index] = tempTimeSlotText;
    onTimeSlotsChange(newTimeSlots);
    setEditingTimeSlot(null);
  };

  const handleAddRow = async () => {
    const newTimeSlots = [...timeSlots, 'New Slot'];
    onTimeSlotsChange(newTimeSlots);
  };

  const handleDeleteRow = async (indexToDelete) => {
    const newTimeSlots = timeSlots.filter((_, i) => i !== indexToDelete);
    onTimeSlotsChange(newTimeSlots);
  };

  const getCellContent = (day, timeSlot) => timetable[day]?.[timeSlot] || 'Free Period';
  const getCellStyle = (subject) => {
    if (subject === 'Lunch Break') return 'bg-orange-100 text-orange-800 border-orange-200';
    if (subject === 'Free Period') return 'bg-gray-100 text-gray-600 border-gray-200';
    return 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors';
  };

  // Format 1: Original grid-based layout
  const renderFormat1 = () => (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Weekly Timetable</CardTitle>
          <div className="flex gap-2">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="border rounded-md p-1 text-sm bg-white"
            >
              <option value="1">1</option>
              <option value="3">2</option>
              <option value="4">3</option>
            </select>
            {editMode && (
              <Button onClick={handleAddRow} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Row
              </Button>
            )}
            <Button
              onClick={() => setEditMode(!editMode)}
              variant={editMode ? "destructive" : "default"}
              size="sm"
            >
              {editMode ? (
                <>
                  <X className="w-4 h-4 mr-2" /> Exit
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2" /> Edit
                </>
              )}
            </Button>
          </div>
        </div>
        {editMode && <p className="text-sm text-gray-600 mt-2">Click on any cell to edit the subject.</p>}
      </CardHeader>
      <CardContent>
        <div>
          <div className="grid grid-cols-7 gap-[1vw] md:gap-2 mb-2">
            <div className="font-bold text-center p-[1vw] md:p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-sm text-[1.8vw] md:text-sm">
              <Clock className="w-[3vw] h-[3vw] md:w-5 md:h-5 mx-auto mb-1" />
              Time
            </div>
            {mockDays.map(day => (
              <div
                key={day}
                className="font-semibold text-center p-[1vw] md:p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-sm text-[1.8vw] md:text-sm"
              >
                {day}
              </div>
            ))}
          </div>
          {timeSlots.map((timeSlot, index) => (
            <div key={`${timeSlot}-${index}`} className="grid grid-cols-7 gap-[1vw] md:gap-2 mb-[1vw] md:mb-2">
              <div className="p-[1vw] md:p-2 bg-gray-100 rounded-lg flex items-center justify-center text-center">
                <span className="text-[1.5vw] md:text-sm font-bold text-gray-800">{timeSlot}</span>
                {editMode && (
                  <div className="flex flex-col md:flex-row">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => {
                        setEditingTimeSlot({ index, text: timeSlot });
                        setTempTimeSlotText(timeSlot);
                      }}
                    >
                      <Edit2 className="w-3 h-3 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteRow(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              {mockDays.map(day => {
                const subject = getCellContent(day, timeSlot);
                return (
                  <div
                    key={`${day}-${timeSlot}`}
                    className={`p-[1vw] md:p-2 rounded-lg border-2 text-center text-[1.5vw] md:text-sm font-medium h-16 flex items-center justify-center overflow-hidden ${getCellStyle(subject)}`}
                    onClick={() => handleCellClick(day, timeSlot)}
                  >
                    <span className="font-semibold break-words">{subject}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <Dialog open={!!editingCell} onOpenChange={() => setEditingCell(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit {editingCell?.day} - {editingCell?.timeSlot}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Select a subject:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {mockSubjects.map(s => (
                    <Button key={s} variant="outline" size="sm" onClick={() => handleSubjectSelect(s)}>
                      {s}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => handleSubjectSelect('Lunch Break')}>
                    Lunch Break
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSubjectSelect('Free Period')}>
                    Free Period
                  </Button>
                </div>
              </div>
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />Add Custom Subject
                </Button>
                {showCustomInput && (
                  <div className="mt-2 flex gap-2">
                    <Input
                      placeholder="Enter custom subject"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomSubjectAdd()}
                    />
                    <Button size="icon" onClick={handleCustomSubjectAdd}>
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={!!editingTimeSlot} onOpenChange={() => setEditingTimeSlot(null)}>
          <DialogContent className="sm:max-w-xs">
            <DialogHeader>
              <DialogTitle>Edit Time Slot</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2">
              <Input
                value={tempTimeSlotText}
                onChange={(e) => setTempTimeSlotText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTimeSlotSave()}
              />
              <Button onClick={handleTimeSlotSave}>
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );

  // Format 2: Flex-based with clamped text size
  const renderFormat3 = () => (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Weekly Timetable</CardTitle>
          <div className="flex gap-2">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="border rounded-md p-1 text-sm bg-white"
            >
              <option value="1">1</option>
              <option value="3">2</option>
              <option value="4">3</option>
            </select>
            {editMode && (
              <Button onClick={handleAddRow} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Row
              </Button>
            )}
            <Button
              onClick={() => setEditMode(!editMode)}
              variant={editMode ? "destructive" : "default"}
              size="sm"
            >
              {editMode ? (
                <>
                  <X className="w-4 h-4 mr-2" /> Exit
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2" /> Edit
                </>
              )}
            </Button>
          </div>
        </div>
        {editMode && <p className="text-sm text-gray-600 mt-2">Click on any cell to edit the subject.</p>}
      </CardHeader>
      <CardContent>
        <div>
          <div className="grid grid-cols-7 gap-[1vw] md:gap-2 mb-2">
            <div className="font-bold text-center p-[1vw] md:p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-sm text-[1.8vw] md:text-sm">
              <Clock className="w-[3vw] h-[3vw] md:w-5 md:h-5 mx-auto mb-1" />
              Time
            </div>
            {mockDays.map(day => (
              <div
                key={day}
                className="font-semibold text-center p-[1vw] md:p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-sm text-[1.8vw] md:text-sm"
              >
                {day}
              </div>
            ))}
          </div>
          {timeSlots.map((timeSlot, index) => (
            <div
              key={`${timeSlot}-${index}`}
              className="flex flex-row gap-[1vw] md:gap-2 mb-[1vw] md:mb-2 items-stretch"
            >
              <div className="p-[1vw] md:p-2 bg-gray-100 rounded-lg flex-1 flex items-center justify-center text-center">
                <span className="text-[1.5vw] md:text-sm font-bold text-gray-800">{timeSlot}</span>
                {editMode && (
                  <div className="flex flex-col md:flex-row ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => {
                        setEditingTimeSlot({ index, text: timeSlot });
                        setTempTimeSlotText(timeSlot);
                      }}
                    >
                      <Edit2 className="w-3 h-3 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteRow(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              {mockDays.map(day => {
                const subject = getCellContent(day, timeSlot);
                return (
                  <div
                    key={`${day}-${timeSlot}`}
                    className={`p-[1vw] md:p-2 rounded-lg border-2 text-center flex-1 flex items-center justify-center overflow-hidden ${getCellStyle(subject)}`}
                    onClick={() => handleCellClick(day, timeSlot)}
                  >
                    <span className="block font-semibold break-words whitespace-normal w-full text-[clamp(0.6rem,1.5vw,1rem)] text-center">{subject}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <Dialog open={!!editingCell} onOpenChange={() => setEditingCell(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit {editingCell?.day} - {editingCell?.timeSlot}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Select a subject:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {mockSubjects.map(s => (
                    <Button key={s} variant="outline" size="sm" onClick={() => handleSubjectSelect(s)}>
                      {s}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => handleSubjectSelect('Lunch Break')}>
                    Lunch Break
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSubjectSelect('Free Period')}>
                    Free Period
                  </Button>
                </div>
              </div>
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />Add Custom Subject
                </Button>
                {showCustomInput && (
                  <div className="mt-2 flex gap-2">
                    <Input
                      placeholder="Enter custom subject"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomSubjectAdd()}
                    />
                    <Button size="icon" onClick={handleCustomSubjectAdd}>
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={!!editingTimeSlot} onOpenChange={() => setEditingTimeSlot(null)}>
          <DialogContent className="sm:max-w-xs">
            <DialogHeader>
              <DialogTitle>Edit Time Slot</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2">
              <Input
                value={tempTimeSlotText}
                onChange={(e) => setTempTimeSlotText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTimeSlotSave()}
              />
              <Button onClick={handleTimeSlotSave}>
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );

  // Format 3: Flex-based with nowrap text
  const renderFormat4 = () => (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Weekly Timetable</CardTitle>
          <div className="flex gap-2">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="border rounded-md p-1 text-sm bg-white"
            >
              <option value="1">1</option>
              <option value="3">2</option>
              <option value="4">3</option>
            </select>
            {editMode && (
              <Button onClick={handleAddRow} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Row
              </Button>
            )}
            <Button
              onClick={() => setEditMode(!editMode)}
              variant={editMode ? "destructive" : "default"}
              size="sm"
            >
              {editMode ? (
                <>
                  <X className="w-4 h-4 mr-2" /> Exit
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2" /> Edit
                </>
              )}
            </Button>
          </div>
        </div>
        {editMode && <p className="text-sm text-gray-600 mt-2">Click on any cell to edit the subject.</p>}
      </CardHeader>
      <CardContent>
        <div>
          <div className="grid grid-cols-7 gap-[1vw] md:gap-2 mb-2">
            <div className="font-bold text-center p-[1vw] md:p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-sm text-[1.8vw] md:text-sm">
              <Clock className="w-[3vw] h-[3vw] md:w-5 md:h-5 mx-auto mb-1" />
              Time
            </div>
            {mockDays.map(day => (
              <div
                key={day}
                className="font-semibold text-center p-[1vw] md:p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-sm text-[1.8vw] md:text-sm"
              >
                {day}
              </div>
            ))}
          </div>
          {timeSlots.map((timeSlot, index) => (
            <div
              key={`${timeSlot}-${index}`}
              className="flex flex-row gap-[1vw] md:gap-2 mb-[1vw] md:mb-2 items-stretch"
            >
              <div className="p-[1vw] md:p-2 bg-gray-100 rounded-lg flex-1 flex items-center justify-center text-center">
                <span className="text-[1.5vw] md:text-sm font-bold text-gray-800">{timeSlot}</span>
                {editMode && (
                  <div className="flex flex-col md:flex-row ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => {
                        setEditingTimeSlot({ index, text: timeSlot });
                        setTempTimeSlotText(timeSlot);
                      }}
                    >
                      <Edit2 className="w-3 h-3 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteRow(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              {mockDays.map(day => {
                const subject = getCellContent(day, timeSlot);
                return (
                  <div
                    key={`${day}-${timeSlot}`}
                    className={`p-[1vw] md:p-2 rounded-lg border-2 text-center flex-1 flex items-center justify-center overflow-hidden ${getCellStyle(subject)}`}
                    onClick={() => handleCellClick(day, timeSlot)}
                  >
                    <span className="block font-semibold text-[min(1rem,1.8vw)] leading-snug whitespace-nowrap overflow-hidden w-full text-center">{subject}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <Dialog open={!!editingCell} onOpenChange={() => setEditingCell(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit {editingCell?.day} - {editingCell?.timeSlot}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Select a subject:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {mockSubjects.map(s => (
                    <Button key={s} variant="outline" size="sm" onClick={() => handleSubjectSelect(s)}>
                      {s}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => handleSubjectSelect('Lunch Break')}>
                    Lunch Break
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSubjectSelect('Free Period')}>
                    Free Period
                  </Button>
                </div>
              </div>
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />Add Custom Subject
                </Button>
                {showCustomInput && (
                  <div className="mt-2 flex gap-2">
                    <Input
                      placeholder="Enter custom subject"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomSubjectAdd()}
                    />
                    <Button size="icon" onClick={handleCustomSubjectAdd}>
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={!!editingTimeSlot} onOpenChange={() => setEditingTimeSlot(null)}>
          <DialogContent className="sm:max-w-xs">
            <DialogHeader>
              <DialogTitle>Edit Time Slot</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2">
              <Input
                value={tempTimeSlotText}
                onChange={(e) => setTempTimeSlotText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTimeSlotSave()}
              />
              <Button onClick={handleTimeSlotSave}>
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );

  // Render the selected format
  const renderTimetable = () => {
    switch (format) {
      case '1':
        return renderFormat1();
      case '3':
        return renderFormat3();
      case '4':
        return renderFormat4();
      default:
        return renderFormat1();
    }
  };

  return renderTimetable();
};

export default TimetableGrid;