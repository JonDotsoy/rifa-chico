import MercadoPago, { Payment, PaymentMethod, Preference } from "mercadopago";

export const mercadoPago = new MercadoPago({
  accessToken: import.meta.env.MERCADOPAGO_ACCESS_TOKEN,
});

export const payment = new Payment(mercadoPago);
export const paymentMethod = new PaymentMethod(mercadoPago);
export const preference = new Preference(mercadoPago);

