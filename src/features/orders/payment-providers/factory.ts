import { PaymentProvider } from '@/generated/prisma';
import { IPaymentProvider, IPaymentProviderFactory } from './interface';
import { StripePaymentProvider } from './stripe';
import { AdminPaymentProvider } from './admin';

/**
 * Payment Provider Factory
 * Add new payment providers here (Midtrans, Xendit, etc.)
 */
export class PaymentProviderFactory implements IPaymentProviderFactory {
  private providers: Map<PaymentProvider, IPaymentProvider>;

  constructor() {
    this.providers = new Map();
    
    // Register available providers
    this.providers.set(PaymentProvider.STRIPE, new StripePaymentProvider());
    this.providers.set(PaymentProvider.ADMIN, new AdminPaymentProvider());
    
    // Add more providers as needed:
    // this.providers.set(PaymentProvider.MIDTRANS, new MidtransPaymentProvider());
    // this.providers.set(PaymentProvider.XENDIT, new XenditPaymentProvider());
  }

  getProvider(provider: PaymentProvider): IPaymentProvider {
    const paymentProvider = this.providers.get(provider);
    
    if (!paymentProvider) {
      throw new Error(`Payment provider ${provider} is not supported`);
    }
    
    return paymentProvider;
  }
}

// Singleton instance
export const paymentProviderFactory = new PaymentProviderFactory();
