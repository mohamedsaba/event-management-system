import api from '@/lib/api';

export const paymentApi = {
  // ATTENDEE — initiate payment for an event
  initiatePayment: async (amountCents, userId, eventId) => {
    // API uses query params, no body. Returns plain string URL.
    const response = await api.post(`/payments/pay?amountCents=${amountCents}&userId=${userId}&eventId=${eventId}`);
    return response.data; // This should be the iframe URL string
  }
};
