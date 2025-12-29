import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

// Initialize Stripe with the secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Export the public key for client-side usage
export const getStripePublicKey = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined in environment variables');
  }
  return process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
};

// Helper function to format amount for Stripe (convert to cents)
export const formatAmountForStripe = (amount: number, currency: string = 'usd'): number => {
  // Zero-decimal currencies (JPY, KRW, etc.) don't need to be multiplied
  const zeroDecimalCurrencies = ['jpy', 'krw', 'vnd', 'clp', 'pyg'];
  
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return Math.round(amount);
  }
  
  return Math.round(amount * 100);
};

// Helper function to format amount from Stripe (convert from cents)
export const formatAmountFromStripe = (amount: number, currency: string = 'usd'): number => {
  const zeroDecimalCurrencies = ['jpy', 'krw', 'vnd', 'clp', 'pyg'];
  
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return amount;
  }
  
  return amount / 100;
};
