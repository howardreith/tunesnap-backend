import mongoose from 'mongoose';
import { accompanimentsOwnedSchema } from './userModel.js';

const saleModel = new mongoose.Schema({
  purchaserId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  accompanimentsSold: [{ type: accompanimentsOwnedSchema }],
  dateCreated: { type: Date, required: true },
  paypalOrderId: String,
  paypalOrderStatus: String,
  paypalCreateTime: Date,
  paypalPayerEmailAddress: String,
  paypalPayerId: String,
  paypalPayeeEmailAddress: String,
  paypalPayeeId: String,
  currency: String,
  totalPrice: String,

}, { collection: 'sales' });
// eslint-disable-next-line new-cap
const SalesModel = new mongoose.model('Sale', saleModel);
export default SalesModel;
