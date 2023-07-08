class Stripe {}
Stripe.prototype.products = {
  create: jest.fn().mockImplementation(({ name }) => ({
    id: 'prod_OE1mM6JkyLDtHZ',
    name,
    created: new Date().getTime() / 1000,
    updated: new Date().getTime() / 1000,
  })),
};
const stripe = jest.fn(() => new Stripe());

module.exports = stripe;
module.exports.Stripe = Stripe;
