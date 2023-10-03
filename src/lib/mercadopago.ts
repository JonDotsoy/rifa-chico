import MercadoPago, { Payment, PaymentMethod, Preference } from "mercadopago";

// @ts-ignore
export const mercadoPago = new MercadoPago.default({
  accessToken: process.env.SECRET_MERCADOPAGO_ACCESS_TOKEN,
});

export const payment = new Payment(mercadoPago);
export const paymentMethod = new PaymentMethod(mercadoPago);
export const preference = new Preference(mercadoPago);
