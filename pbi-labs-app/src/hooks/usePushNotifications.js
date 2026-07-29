export default function usePushNotifications() {
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support push notifications.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
    }
  };

  const sendAlert = (title, message) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  };

  return { requestPermission, sendAlert };
}