import UserModel from '../models/userModel.js';
import SalesModel from '../models/salesModel.js';

export async function createSale(saleData, purchaserId) {
  const detailedAccompanimentsSold = saleData.accompanimentsSold.map((accomp) => ({
    accompaniment: accomp.id,
    pricePaid: accomp.pricePaid,
    currency: saleData.currency,
    dateOfPurchase: new Date(),
  }));
  const parsedData = {
    purchaserId,
    accompanimentsSold: detailedAccompanimentsSold,
    dateCreated: new Date(),
    currency: saleData.currency,
    totalPrice: saleData.totalPrice,
  };
  const newSale = new SalesModel(parsedData);
  let savedSale;
  try {
    savedSale = await newSale.save();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error saving sale: ', e);
  }

  const user = await UserModel.findById(purchaserId);
  const purchaserOwnedAccompaniments = [...user.accompanimentsOwned, ...detailedAccompanimentsSold];
  await UserModel.findByIdAndUpdate(purchaserId,
    { accompanimentsOwned: purchaserOwnedAccompaniments, cart: [] });

  return { accompanimentsOwned: purchaserOwnedAccompaniments, saleId: savedSale._id };
}
