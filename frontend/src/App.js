import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import WidgetPage from "./components/WidgetPage";
import { Toaster } from "./components/ui/toaster";
import { initializeCapacitor } from "./utils/capacitor";
//import { initializeAppData } from "./utils/storage";

function App() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize Capacitor for native Android features
        const isNative = await initializeCapacitor();
        console.log('App initialized:', isNative ? 'Native Android' : 'Web Browser');
        
        // Initialize app data (timetable and syllabus)
        await initializeAppData();
        console.log('App data initialized');
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    
    initializeApp();
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/widget" element={<WidgetPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;