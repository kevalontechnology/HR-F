import logoImg from '../Kevalon_Technology_Logo_Transparent.png';

/**
 * Utility for triggering Browser Desktop Web Notifications
 */
export const requestWebNotificationPermission = async () => {
  if (!('Notification' in window)) {
    alert('This browser does not support desktop web notifications.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      triggerDesktopNotification(
        '🔔 Kevalon CRM Web Notifications Enabled!',
        'You will now receive instant desktop alerts for candidate assignments, check-ins, and stage updates.'
      );
      return true;
    }
  }

  return false;
};

export const triggerDesktopNotification = (title, body, tag = null) => {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body: body,
        icon: logoImg,
        badge: logoImg,
        tag: tag || `kevalon-notif-${Date.now()}`,
        requireInteraction: false
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (err) {
      console.error('Web notification error:', err);
    }
  }
};
