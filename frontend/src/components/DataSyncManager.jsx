// src/components/DataSyncManager.jsx

import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Upload, Download, Settings } from 'lucide-react';

// Import Capacitor plugins
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share'; // Import the new Share plugin

const DataSyncManager = ({ data, onImport }) => {
  const fileInputRef = useRef(null);

  // Export logic for web browsers (remains the same)
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

  // New export logic for native devices using the Share plugin
  const handleNativeExport = async () => {
    const fileName = `college-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    try {
      // 1. Write the file to the app's temporary cache directory
      const result = await Filesystem.writeFile({
        path: fileName,
        data: JSON.stringify(data, null, 2),
        directory: Directory.Cache, // Use the app's private cache
        encoding: Encoding.UTF8,
      });

      // 2. Use the Share plugin to open the native share dialog
      await Share.share({
        title: 'College Planner Backup',
        text: 'Here is your app data backup file.',
        url: result.uri, // The URI of the file we just wrote
        dialogTitle: 'Share or Save Backup',
      });

    } catch (error) {
      // If the user cancels the share dialog, it might throw an "AbortError", which we can ignore.
      if (error.name === 'AbortError') {
        console.log('Share dialog was cancelled by the user.');
        return;
      }
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

  // Import logic (remains the same)
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