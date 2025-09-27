// src/components/SyllabusManager.jsx

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { ScrollArea } from './ui/scroll-area';
import { BookOpen, Plus, Edit3, Save, X, Trash2 } from 'lucide-react';
import { saveSyllabusToStorage } from '../utils/storage';

const SyllabusManager = ({ selectedSubject, onClose, subjects: subjectList, syllabusData, onSyllabusChange }) => {
  const [editingSubject, setEditingSubject] = useState(null);
  const [newTopic, setNewTopic] = useState('');
  const [editingTopic, setEditingTopic] = useState({ index: null, text: '' });

  const saveSyllabus = async (data) => {
    onSyllabusChange(data);
    await saveSyllabusToStorage(data);
  };

  const addTopic = async (subject) => {
    if (!newTopic.trim()) return;
    const updatedData = { ...syllabusData, [subject]: [...(syllabusData[subject] || []), newTopic.trim()] };
    await saveSyllabus(updatedData);
    setNewTopic('');
  };

  const updateTopic = async (subject, index, newText) => {
    if (!newText.trim()) return;
    const updatedTopics = [...syllabusData[subject]];
    updatedTopics[index] = newText.trim();
    const updatedData = { ...syllabusData, [subject]: updatedTopics };
    await saveSyllabus(updatedData);
    setEditingTopic({ index: null, text: '' });
  };

  const deleteTopic = async (subject, index) => {
    const updatedTopics = syllabusData[subject].filter((_, i) => i !== index);
    const updatedData = { ...syllabusData, [subject]: updatedTopics };
    await saveSyllabus(updatedData);
  };

  const startEditingTopic = (index, text) => {
    setEditingTopic({ index, text });
  };

  const subjects = subjectList.sort();

  // FIX: Keyboard-friendly dialog view
  if (selectedSubject) {
    const topics = syllabusData[selectedSubject] || [];
    return (
      <Dialog open={!!selectedSubject} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl h-[90vh] sm:h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              {selectedSubject} - Syllabus
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-grow pr-4 -mr-4 my-4">
            <div className="space-y-4">
              {topics.length > 0 ? (
                <div className="space-y-3">
                  {topics.map((topic, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">{index + 1}</div>
                      <div className="flex-1 min-w-0">
                        {editingTopic.index === index ? (
                          <div className="flex gap-2">
                            <Textarea value={editingTopic.text} onChange={(e) => setEditingTopic({ ...editingTopic, text: e.target.value })} className="flex-1" rows={3} />
                            <div className="flex flex-col gap-1"><Button size="sm" onClick={() => updateTopic(selectedSubject, index, editingTopic.text)}><Save className="w-4 h-4" /></Button><Button size="sm" variant="outline" onClick={() => setEditingTopic({ index: null, text: '' })}><X className="w-4 h-4" /></Button></div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-gray-700 leading-relaxed break-words">{topic}</p>
                            <div className="flex gap-1"><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEditingTopic(index, topic)}><Edit3 className="w-4 h-4" /></Button><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteTopic(selectedSubject, index)}><Trash2 className="w-4 h-4" /></Button></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500"><BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No syllabus topics added yet</p></div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t pt-4 flex-shrink-0">
            <div className="flex gap-2">
              <Textarea placeholder="Add a new syllabus topic..." value={newTopic} onChange={(e) => setNewTopic(e.target.value)} rows={2} className="flex-1" />
              <Button onClick={() => addTopic(selectedSubject)} disabled={!newTopic.trim()} className="self-end"><Plus className="w-4 h-4 mr-1" />Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // FIX: Scrollable main view
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><BookOpen className="w-6 h-6 text-blue-600" />Syllabus Manager</CardTitle>
        <p className="text-sm text-gray-600">Manage syllabus topics for all your subjects</p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-22rem)] pr-4">
          <Accordion type="multiple" className="space-y-2">
            {subjects.map(subject => {
              const topics = syllabusData[subject] || [];
              return (
                <AccordionItem key={subject} value={subject} className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline"><div className="flex items-center justify-between w-full mr-4"><span className="font-medium">{subject}</span><Badge variant="secondary" className="text-xs">{topics.length} topics</Badge></div></AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      {topics.map((topic, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">{index + 1}</div>
                          <div className="flex-1 min-w-0">
                            {editingTopic.index === index && editingSubject === subject ? (
                              <div className="flex gap-2">
                                <Textarea value={editingTopic.text} onChange={(e) => setEditingTopic({ ...editingTopic, text: e.target.value })} className="flex-1" rows={3} />
                                <div className="flex flex-col gap-1"><Button size="sm" onClick={() => updateTopic(subject, index, editingTopic.text)}><Save className="w-4 h-4" /></Button><Button size="sm" variant="outline" onClick={() => { setEditingTopic({ index: null, text: '' }); setEditingSubject(null); }}><X className="w-4 h-4" /></Button></div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm text-gray-700 leading-relaxed break-words">{topic}</p>
                                <div className="flex gap-1"><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { startEditingTopic(index, topic); setEditingSubject(subject); }}><Edit3 className="w-4 h-4" /></Button><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteTopic(subject, index)}><Trash2 className="w-4 h-4" /></Button></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-3">
                        <div className="flex gap-2">
                            <Textarea placeholder={`Add a new topic for ${subject}...`} value={editingSubject === subject ? newTopic : ''} onChange={(e) => { setNewTopic(e.target.value); setEditingSubject(subject); }} rows={2} className="flex-1" />
                            <Button onClick={() => addTopic(subject)} disabled={!newTopic.trim() || editingSubject !== subject} size="sm" className="self-end"><Plus className="w-4 h-4" />
                            </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
          {subjects.length === 0 && (<div className="text-center py-8 text-gray-500"><BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No syllabus data found</p><p className="text-sm">Add subjects in the 'Subjects' tab first</p></div>)}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SyllabusManager;