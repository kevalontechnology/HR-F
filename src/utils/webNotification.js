import logoImg from '../Kevalon_Technology_Logo_Transparent.png';

/**
 * Melodic Notification Chime Sound Synthesizer via Web Audio API
 */
export const playNotificationChimeSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    
    // Note 1 (D5 - 587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.25, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Note 2 (A5 - 880 Hz - Crystal Alert Chime)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (err) {
    console.error('Audio chime play error:', err);
  }
};

/**
 * Request Browser Desktop Web Notifications Permission
 */
export const requestWebNotificationPermission = async () => {
  if (!('Notification' in window)) {
    alert('This browser does not support desktop web notifications.');
    return false;
  }

  // Play test chime sound
  playNotificationChimeSound();

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      triggerDesktopNotification(
        '🔔 Kevalon CRM Web Notifications Enabled!',
        'You will now receive instant desktop alerts and chime sounds for candidate assignments & updates.'
      );
      return true;
    }
  }

  return false;
};

/**
 * Trigger OS-Level Desktop Web Push Notification with Chime Sound
 */
export const triggerDesktopNotification = (title, body, tag = null) => {
  // Always play notification chime sound
  playNotificationChimeSound();

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
