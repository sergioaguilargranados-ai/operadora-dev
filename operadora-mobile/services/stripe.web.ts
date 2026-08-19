import React from 'react'

export const StripeProvider = ({ children }: { children?: any; [key: string]: any }) => {
  return React.createElement(React.Fragment, null, children)
}

export const useStripe = () => {
  return {
    initPaymentSheet: async (_opts: any) => ({ error: null }),
    presentPaymentSheet: async () => ({ error: null }),
    confirmPayment: async (_clientSecret: string, _data: any) => ({
      paymentIntent: { status: 'Succeeded' },
      error: null,
    }),
  }
}

export default {
  StripeProvider,
  useStripe,
}
