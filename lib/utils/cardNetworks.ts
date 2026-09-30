import type { CardNetwork } from '@/lib/db/types';

export const CARD_NETWORKS: Array<{
  id: CardNetwork;
  label: string;
  shortLabel: string;
  digits: number;
  cvcDigits: number;
}> = [
  { id: 'visa', label: 'Visa', shortLabel: 'VISA', digits: 16, cvcDigits: 3 },
  { id: 'mastercard', label: 'Mastercard', shortLabel: 'mastercard', digits: 16, cvcDigits: 3 },
  { id: 'amex', label: 'American Express', shortLabel: 'AMEX', digits: 15, cvcDigits: 4 },
  { id: 'discover', label: 'Discover', shortLabel: 'DISCOVER', digits: 16, cvcDigits: 3 },
  { id: 'unionpay', label: 'UnionPay', shortLabel: 'UnionPay', digits: 16, cvcDigits: 3 },
];

export function detectCardNetwork(value: string): CardNetwork | null {
  const digits = value.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^(6011|65|64[4-9])/.test(digits)) return 'discover';
  if (/^62/.test(digits)) return 'unionpay';
  return null;
}

export function getCardNetwork(value?: CardNetwork | null) {
  return CARD_NETWORKS.find((network) => network.id === value) ?? CARD_NETWORKS[0];
}

export function formatNetworkCardNumber(value: string) {
  const digits = value.replace(/\D/g, '');
  const network = getCardNetwork(detectCardNetwork(digits));
  const limited = digits.slice(0, network.digits);
  if (network.id === 'amex') {
    return [limited.slice(0, 4), limited.slice(4, 10), limited.slice(10, 15)].filter(Boolean).join(' ');
  }
  return limited.match(/.{1,4}/g)?.join(' ') ?? limited;
}
