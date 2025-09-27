// src/components/SubjectsManager.jsx

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trash2, Plus, BookCopy } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

const SubjectsManager = ({ subjects, onAddSubject, onDeleteSubject }) => {
  const [newSubject, setNewSubject] = useState('');

  const handleAddClick = () => {
    if (newSubject.trim()) {
      onAddSubject(newSubject.trim());
      setNewSubject('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookCopy className="w-6 h-6 text-indigo-600" />
          Manage Subjects
        </CardTitle>
        <p className="text-sm text-gray-600">Add or remove subjects. This will update your timetable and syllabus.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input
            placeholder="Enter new subject name..."
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddClick()}
          />
          <Button onClick={handleAddClick} disabled={!newSubject.trim()}>
            <Plus className="w-4 h-4 mr-2" /> Add Subject
          </Button>
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-800">Your Subjects</h3>
          {subjects.length > 0 ? (
            <ul className="border rounded-lg divide-y">
              {subjects.map((subject) => (
                <li key={subject} className="flex items-center justify-between p-3">
                  <span className="font-medium text-gray-700">{subject}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the subject "{subject}" and all its data from your timetable and syllabus. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteSubject(subject)} className="bg-red-600 hover:bg-red-700">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
              <BookCopy className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No subjects added yet.</p>
              <p className="text-sm">Add a subject to get started.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectsManager;