import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe('pk_test_51O1gHEB4ZEWdjEyS2FjsbRDzItUIXHERudxhZdp4aPGoSXtiD3sqAclX5RC01rkVZiX3BtljWXgXS4RwMvVqJnOt00knexPvjG');
  }
  return stripePromise;
};

export default getStripe;
