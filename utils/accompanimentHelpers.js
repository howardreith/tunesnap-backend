// eslint-disable-next-line import/prefer-default-export
export function getRatingData(accompaniment, userId) {
  const ratingNumbers = accompaniment.ratings.map((rat) => rat.rating);
  const averageRating = ratingNumbers && ratingNumbers.reduce((a, b) => a + b, 0) / ratingNumbers.length;
  const roundedAverageRating = Math.round(averageRating * 10) / 10;
  const userRating = accompaniment.ratings.find((rat) => rat.raterId.toString() === userId);
  const userRatingNumber = userRating ? userRating.rating : null;
  return { averageRating: roundedAverageRating, userRating: userRatingNumber };
}
