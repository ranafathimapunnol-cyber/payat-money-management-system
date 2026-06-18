export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Notification permission error:', error);
    return false;
  }
};

export const sendNotification = (title, body, icon = '/payat-icon.png') => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, { body, icon });
    } catch (error) {
      console.error('Notification error:', error);
    }
  }
};

export const scheduleReminder = (title, body, delayMinutes = 5) => {
  const delayMs = delayMinutes * 60 * 1000;
  setTimeout(() => {
    sendNotification(title, body);
  }, delayMs);
};
