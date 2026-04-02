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

export const setupDailyReminders = async () => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    let permStatus = await LocalNotifications.checkPermissions();
    if (permStatus.display !== 'granted') {
      permStatus = await LocalNotifications.requestPermissions();
      if (permStatus.display !== 'granted') return;
    }

    // Cancel existing scheduled reminders to prevent dupes
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }

    const scheduleTimes = [
      { id: 1, hour: 6, minute: 0, title: 'Uth Jaa Bhai 🌅', body: 'Subah ho gayi. Chai-Nashte pe udha diye paise? Track kar le chup-chap!' },
      { id: 2, hour: 8, minute: 0, title: 'Safar Ka Kharcha 🚗', body: 'Auto/Cab me kitna uraya aaj? Bura lagne se pehle expenses me daal de.' },
      { id: 3, hour: 10, minute: 0, title: 'Kaam Pe Dhyan De 💼', body: 'Expenses add kiya kya? Nahi toh kar le, account track par rahega.' },
      { id: 4, hour: 12, minute: 0, title: 'Bhookh Lagi Hai? 🍔', body: 'Zomato/Swiggy band kar bhai! Ghar ka kha aur paise bacha.' },
      { id: 5, hour: 13, minute: 30, title: 'Chai-Sutta Break ☕', body: 'Kitni chai peeyega din mein? Uska bhi hisaab app mein likhna hota hai.' },
      { id: 6, hour: 15, minute: 0, title: 'Split Group Update 📊', body: 'Tera dost kab paise dega wapas? Yaad se Splits verify karle!' },
      { id: 7, hour: 18, minute: 0, title: 'Din Khatam 🌇', body: 'Awaaragardi khatam? Chal aaj ka sab kharcha chup-chap note kar!' },
      { id: 8, hour: 20, minute: 0, title: 'Dinner Time 🍕', body: 'Bahar khane ki aukaat hai kya iss mahine? Budget dekh le pehle.' },
      { id: 9, hour: 22, minute: 0, title: 'Online Shopping 🛒', body: 'Amazon cart verify karne se pehle app ka balance verify kar le garib!' },
      { id: 10, hour: 0, minute: 0, title: 'Din Bhar Ka Hisaab 🕛', body: 'Kahan kahan note udaye aaj paise? Yaad karke daal de, warna month end me royega.' },
      { id: 11, hour: 2, minute: 0, title: 'So Jaa Bhai 😴', body: 'Raat ko dimaag kharab karke online faltu kharche mat kar, so ja peace mein.' },
      { id: 12, hour: 4, minute: 0, title: 'Sapne Dekh 💤', body: 'Aise hi sota reh bhaai, sapno mein hi ameer banega tu. Account mein balance toh hai nahi!' }
    ];

    const notifications = scheduleTimes.map(t => ({
      id: t.id + 1000, // offset
      title: t.title,
      body: t.body,
      schedule: { on: { hour: t.hour, minute: t.minute }, repeats: true },
    }));

    await LocalNotifications.schedule({ notifications });
    console.log("Daily reminders scheduled!");
  } catch (err) {
    console.error("Failed scheduling daily reminders", err);
  }
};
