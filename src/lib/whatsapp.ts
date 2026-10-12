import { CartItem, CheckoutCustomerInfo, Merchant } from '../types/store';
import { formatNGN } from './validation';

export function generateWhatsAppOrderMessage(
  merchant: Merchant,
  cartItems: CartItem[],
  customerInfo: CheckoutCustomerInfo
): string {
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const now = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const itemsList = cartItems
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.product.name}*  (x${item.quantity})\n   ↳ ${formatNGN(item.product.price * item.quantity)}`
    )
    .join('\n\n');

  const lines = [
    `🛍️ *NEW ORDER - ${merchant.storeName.toUpperCase()}*`,
    `───────────────`,
    `📅 *Order Time:* ${now}`,
    ``,
    `👤 *Customer Information:*`,
    `• Name: *${customerInfo.buyerName.trim()}*`,
    customerInfo.phoneNumber ? `• Phone: ${customerInfo.phoneNumber.trim()}` : null,
    `• Delivery Address:\n  📍 ${customerInfo.deliveryAddress.trim()}`,
    customerInfo.deliveryNotes ? `• Notes: 📝 ${customerInfo.deliveryNotes.trim()}` : null,
    ``,
    `🛒 *Items Ordered (${cartItems.reduce((acc, i) => acc + i.quantity, 0)} items):*`,
    itemsList,
    ``,
    `───────────────`,
    `💰 *TOTAL AMOUNT: ${formatNGN(totalAmount)}*`,
    `───────────────`,
    ``,
    `Please confirm order availability and share payment/account details for transfer. Thank you! 🙌`,
  ].filter((line) => line !== null);

  return lines.join('\n');
}

export function generateWhatsAppUrl(
  whatsappNumber: string,
  message: string
): string {
  // Ensure whatsappNumber has no non-digits
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}
