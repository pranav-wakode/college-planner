import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

export const initializeCapacitor = async () => {
  try {
    // Check if we're running as a native app
    if (window?.Capacitor?.isNativePlatform?.()) {
      console.log('Running as native Android app');
      
      // Configure status bar
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#3b82f6' });
      
      // Hide splash screen after app loads
      await SplashScreen.hide();
      
      return true;
    } else {
      console.log('Running as web app');
      return false;
    }
  } catch (error) {
    console.error('Error initializing Capacitor:', error);
    return false;
  }
};

export const showNativeToast = async (message) => {
  // For now, we'll use web toast, but this can be extended with native toast plugin
  console.log('Toast:', message);
};

export const isNativeApp = () => {
  return window?.Capacitor?.isNativePlatform?.() || false;
};