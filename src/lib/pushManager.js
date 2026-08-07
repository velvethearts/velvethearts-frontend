import { api } from './api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !api.isConfigured) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return false;
    }

    const reg = await navigator.serviceWorker.ready;

    // Get VAPID public key from backend
    const vapidRes = await api.getVapidPublicKey();
    const vapidPublicKey = vapidRes?.publicKey;

    if (!vapidPublicKey) {
      console.warn('VAPID public key not returned by backend');
      return false;
    }

    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
    }

    // Send subscription object to backend
    await api.subscribePush(subscription);

    console.log('✅ Web Push subscription registered with backend');
    return true;
  } catch (err) {
    console.warn('Failed to register Web Push notifications:', err);
    return false;
  }
}
