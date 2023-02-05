import fs from 'fs';
import { compareImages } from '../../image/compare';

describe('compare images test', () => {
  test('same images', async () => {
    const firstImageBuffer: Buffer = fs.readFileSync(`${__dirname}/file_same_1.jpg`);
    const secondImageBuffer: Buffer = fs.readFileSync(`${__dirname}/file_same_2.jpg`);
    const threshold: number = 1;

    const isSame = await compareImages(firstImageBuffer, secondImageBuffer, threshold);

    expect(isSame).toBeTruthy();
  });

  test('similar image with default threshold', async () => {
    const firstImageBuffer: Buffer = fs.readFileSync(`${__dirname}/file_same_1.jpg`);
    const secondImageBuffer: Buffer = fs.readFileSync(`${__dirname}/file_similar.jpg`);
    const threshold: number = 1000;

    const isSame = await compareImages(firstImageBuffer, secondImageBuffer, threshold);

    expect(isSame).toBeTruthy();
  });

  test('different images', async () => {
    const firstImageBuffer: Buffer = fs.readFileSync(`${__dirname}/file_same_1.jpg`);
    const secondImageBuffer: Buffer = fs.readFileSync(`${__dirname}/file_not_same.png`);
    const threshold: number = 1000;

    const isSame = await compareImages(firstImageBuffer, secondImageBuffer, threshold);

    expect(isSame).toBeFalsy();
  });
});
