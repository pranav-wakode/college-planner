// src/components/DataSyncManager.jsx

import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Upload, Download, Settings } from 'lucide-react';

// Import Capacitor plugins
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const DataSyncManager = ({ data, onImport }) => {
  const fileInputRef = useRef(null);

  const handleWebExport = () => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = `college-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } catch (error) {
      console.error("Failed to export data for web:", error);
      alert("An error occurred while exporting your data.");
    }
  };

  const handleNativeExport = async () => {
    const fileName = `college-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    try {
      const result = await Filesystem.writeFile({
        path: fileName,
        data: JSON.stringify(data, null, 2),
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      await Share.share({
        title: 'College Planner Backup',
        text: 'Here is your app data backup file.',
        url: result.uri,
        dialogTitle: 'Share or Save Backup',
      });

    } catch (error) {
      // --- FIX: This block is now updated ---
      // We check if the error message is the specific "Share canceled" one.
      // If it is, we do nothing. It's not a real error.
      if (error && error.message && error.message.includes('Share canceled')) {
        console.log('Share dialog was dismissed by the user.');
        return; // Exit the function gracefully
      }

      // For any other, unexpected errors, we still show an alert.
      console.error("Failed to export data for native:", error);
      alert(`An error occurred while exporting your data: ${error.message}`);
    }
  };

  const handleExport = () => {
    if (Capacitor.isNativePlatform()) {
      handleNativeExport();
    } else {
      handleWebExport();
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          if (importedData.subjects && importedData.timetable && importedData.syllabus) {
            onImport(importedData);
            alert("Data imported successfully!");
          } else {
            alert("Invalid file format. Please import a valid backup file.");
          }
        } catch (error) {
          console.error("Failed to parse imported file:", error);
          alert("Could not read the file. It may be corrupted.");
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please select a valid .json file.");
    }
    event.target.value = null;
  };

  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardHeader className='pb-4'>
        <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Data Backup & Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".json"
          className="hidden"
        />
        <Button onClick={() => fileInputRef.current.click()} variant="outline" className="w-full">
          <Upload className="w-4 h-4 mr-2" /> Import from File
        </Button>
        <Button onClick={handleExport} className="w-full">
          <Download className="w-4 h-4 mr-2" /> Export to File
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataSyncManager;