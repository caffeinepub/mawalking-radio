export function buildPhoneLink(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  return `tel:${cleaned}`;
}

export function buildDirectionsLink(
  address: {
    street: string;
    city: string;
    state: string;
    latitude?: number;
    longitude?: number;
  }
): string {
  // Prefer coordinates if available
  if (address.latitude && address.longitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${address.latitude},${address.longitude}`;
  }

  // Fallback to address string
  const addressString = `${address.street}, ${address.city}, ${address.state}`;
  const encoded = encodeURIComponent(addressString);
  return `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
}
