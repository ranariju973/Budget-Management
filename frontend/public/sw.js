self.addEventListener('push', function (event) {
  let pushData = {
    title: 'FinKart',
    body: 'New notification from FinKart',
    icon: '/favicon.ico',
  };

  try {
    if (event.data) {
      pushData = event.data.json();
    }
  } catch (err) {
    if (event.data) {
      pushData.body = event.data.text();
    }
  }

  const options = {
    body: pushData.body,
    icon: pushData.icon || '/favicon.ico',
    tag: pushData.tag || 'finkart-notification',
    requireInteraction: pushData.requireInteraction || false,
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    data: pushData.data || { url: '/' },
  };

  event.waitUntil(
    self.registration.showNotification(pushData.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Open the app when the notification is clicked
  const urlToOpen = new URL(event.notification.data.url || '/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If so, just focus it
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
