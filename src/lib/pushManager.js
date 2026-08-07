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

  const token = api.tokenStore.getToken();
  if (!token) {
    console.warn('Postponing Push Registration: Auth token not present yet');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission status:', permission);
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

    // Reset old subscription if present to guarantee alignment with current VAPID key
    if (subscription) {
      try {
        await subscription.unsubscribe();
      } catch (e) {
        console.warn('Unsubscribe previous push subscription error:', e);
      }
    }

    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey,
    });

    // Send subscription object to backend
    await api.subscribePush(subscription);

    console.log('✅ Web Push subscription registered with backend');
    return true;
  } catch (err) {
    console.warn('Failed to register Web Push notifications:', err);
    return false;
  }
}
