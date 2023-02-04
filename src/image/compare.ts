import Jimp from 'jimp';
import { logger } from '../utils/logger';

/**
 * Compares two images and returns whether they are considered similar or not based on a given threshold.
 *
 * The comparison is done by resizing and grayscaling both images to have the same size, then comparing their pixels
 * using the Mean Squared Error (MSE) algorithm. The MSE is defined as the average of the squared differences between
 * each corresponding pixel in both images. If the MSE is lower than the given threshold, the images are considered
 * similar, otherwise they are considered different.
 *
 * @param firstImageArrayBuffer - The array buffer of the first image.
 * @param secondImageArrayBuffer - The array buffer of the second image.
 * @param threshold - The maximum allowed MSE between the two images for them to be considered similar.
 *
 * @returns A promise that resolves to `true` if the images are considered similar, and `false` otherwise.
 *
 * @see {@link https://en.wikipedia.org/wiki/Mean_squared_error}
 * for more information on the Mean Squared Error (MSE) algorithm.
 */
export const compareImages = async (
  firstImageArrayBuffer: any,
  secondImageArrayBuffer: any,
  threshold: number
): Promise<boolean> => {
  const firstImage = await Jimp.read(Buffer.from(firstImageArrayBuffer, 'binary'));
  const secondImage = await Jimp.read(Buffer.from(secondImageArrayBuffer, 'binary'));

  const maxWidth = Math.max(firstImage.bitmap.width, secondImage.bitmap.width);
  const maxHeight = Math.max(firstImage.bitmap.height, secondImage.bitmap.height);

  firstImage.resize(maxWidth, maxHeight).grayscale();
  secondImage.resize(maxWidth, maxHeight).grayscale();

  let differenceSquaredSum = 0;
  for (let i = 0; i < firstImage.bitmap.data.length; i += 4) {
    const grayValueFirst = firstImage.bitmap.data[i];
    const grayValueSecond = secondImage.bitmap.data[i];

    const grayValueDifference = grayValueSecond - grayValueFirst;

    differenceSquaredSum += grayValueDifference * grayValueDifference;
  }

  const meanSquaredError = differenceSquaredSum / (maxWidth * maxHeight);
  const isSame = meanSquaredError < threshold;
  logger.debug({ meanSquaredError, isSame });
  return isSame;
}
