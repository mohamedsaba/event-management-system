import api from '@/lib/api';

export const paymentApi = {
  // ATTENDEE — initiate payment for an event
  initiatePayment: async (amountCents, userId, eventId) => {
    // Backend flow: POST /api/Paymob/pay?amountCents=&userId=&eventId=
    const response = await api.post(
      `/Paymob/pay?amountCents=${amountCents}&userId=${userId}&eventId=${eventId}`
    );

    // Support either plain URL response or object payload.
    if (typeof response.data === "string") return response.data;
    return response.data?.iframeUrl || response.data?.url || null;
  }
};
