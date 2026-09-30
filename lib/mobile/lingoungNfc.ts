import { Capacitor, registerPlugin } from '@capacitor/core';

interface LingoungNfcPlugin {
  getStatus(): Promise<{ supported: boolean; enabled: boolean }>;
  startCardEmulation(options: { token: string }): Promise<void>;
  stopCardEmulation(): Promise<void>;
  readPaymentToken(): Promise<{ token: string }>;
  cancelRead(): Promise<void>;
}

const LingoungNfc = registerPlugin<LingoungNfcPlugin>('LingoungNfc');

export function isLingoungAndroidApp() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export async function getLingoungNfcStatus() {
  if (!isLingoungAndroidApp()) return { supported: false, enabled: false };
  return await LingoungNfc.getStatus();
}

export async function enableNfcPaymentCard(token: string) {
  return await LingoungNfc.startCardEmulation({ token });
}

export async function disableNfcPaymentCard() {
  return await LingoungNfc.stopCardEmulation();
}

export async function readLingoungPaymentToken() {
  return await LingoungNfc.readPaymentToken();
}

export async function cancelLingoungNfcRead() {
  return await LingoungNfc.cancelRead();
}