import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Upload, Download, Settings } from 'lucide-react';

const DataSyncManager = ({ data, onImport }) => {
  const fileInputRef = useRef(null);

  // FIX: Using a more reliable method for file download
  const handleExport = () => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const href = URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = href;
      link.download = `college-planner-backup-${new Date().toISOString().split('T')[0]}.json`;

      // Append to the DOM, click, and then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(href);

    } catch (error) {
      console.error("Failed to export data:", error);
      alert("An error occurred while exporting your data.");
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
    event.target.value = null; // Reset input
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