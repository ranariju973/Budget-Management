import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export const scheduleLocalNotification = async (title, body) => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    // Request permissions if not already granted
    let permStatus = await LocalNotifications.checkPermissions();
    if (permStatus.display !== 'granted') {
      permStatus = await LocalNotifications.requestPermissions();
    }
    
    if (permStatus.display !== 'granted') {
      return; // Can't send
    }

    // Schedule notification immediately
    await LocalNotifications.schedule({
      notifications: [
        {
          title: title,
          body: body,
          id: new Date().getTime(),
          schedule: { at: new Date(Date.now() + 1000) }, // Trigger almost immediately
          sound: null,
          attachments: null,
          actionTypeId: '',
          extra: null,
        },
      ],
    });
  } catch (err) {
    console.error('Failed to schedule local notification', err);
  }
};
