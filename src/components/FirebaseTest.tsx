'use client';

import { useEffect, useState } from 'react';
import { getAnalyticsService } from '@/features/firebase';

export function FirebaseTest() {
  const [status, setStatus] = useState<string>('Initializing...');
  const [analyticsReady, setAnalyticsReady] = useState(false);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        const analyticsService = getAnalyticsService();
        
        // Wait for analytics to be ready
        const ready = await analyticsService.waitForReady();
        
        if (ready) {
          setAnalyticsReady(true);
          setStatus('✅ Firebase Analytics is working!');
          
          // Log a test event
          analyticsService.logEvent('firebase_test_initialized', {
            test_param: 'initialization_success',
            timestamp: new Date().toISOString(),
          });
          
          // Log page view
          analyticsService.logPageView('/test', 'Firebase Test Page');
          
        } else {
          setStatus('⚠️ Analytics not supported in this environment');
        }

      } catch (error) {
        setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('Firebase initialization error:', error);
      }
    };

    initFirebase();
  }, []);

  const handleTestEvent = () => {
    try {
      const analyticsService = getAnalyticsService();
      
      analyticsService.logEvent('button_click', {
        button_name: 'test_analytics_button',
        timestamp: new Date().toISOString(),
      });
      
      console.log('✅ Button click event logged successfully');
      alert('Event logged! Check Firebase Console and browser console.');
    } catch (error) {
      console.error('Failed to log event:', error);
      alert('Failed to log event. Check console for details.');
    }
  };

  const handleTestPurchase = () => {
    try {
      const analyticsService = getAnalyticsService();
      
      analyticsService.logPurchase('TEST_' + Date.now(), 99.99, 'USD');
      
      console.log('✅ Purchase event logged successfully');
      alert('Purchase event logged! Check Firebase Console.');
    } catch (error) {
      console.error('Failed to log purchase:', error);
    }
  };

  return (
    <div className="w-full p-6 border rounded-lg space-y-4 bg-white dark:bg-zinc-900">
      <h2 className="text-xl font-bold">Firebase Analytics Status</h2>
      <p className="text-lg">{status}</p>
      
      {analyticsReady && (
        <div className="flex flex-col gap-3">
          <button
            onClick={handleTestEvent}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Log Custom Event
          </button>
          
          <button
            onClick={handleTestPurchase}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Log Purchase Event
          </button>
        </div>
      )}
      
      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <p>✓ Check the browser console for detailed logs</p>
        <p>✓ Check Firebase Console → Analytics → Events for real-time data</p>
        <p>✓ Events may take a few minutes to appear in Firebase Console</p>
      </div>
    </div>
  );
}
