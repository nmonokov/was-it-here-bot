import { Collection, FindCursor, InsertOneResult, ObjectId, WithId } from 'mongodb';
import { ImageData } from '../../model';
import { anyString, anything, deepEqual, instance, mock, reset, when } from 'ts-mockito';
import { MongoCollection } from '../../server/mongoCollection';
import { getImageData } from '../utils';

describe('mongo collection test', () => {
  const collectionMock: Collection<ImageData> = mock(Collection<ImageData>);
  const findCursor: FindCursor<WithId<ImageData>> = mock(FindCursor);

  afterEach(() => {
    reset(collectionMock);
  });

  test('add::successful', async () => {
    const mongoCollection: MongoCollection = new MongoCollection(instance(collectionMock));
    const imageData: ImageData = getImageData(0);
    when(await collectionMock.insertOne(imageData)).thenReturn({
      acknowledged: true,
      insertedId: anyString(),
    });

    const result: InsertOneResult<ImageData> = await mongoCollection.addData(imageData);

    expect(result.acknowledged).toBeTruthy();
  });

  test('add::fail', async () => {
    const imageData: ImageData = getImageData(0);
    when(await collectionMock.insertOne(anything())).thenThrow(new Error());

    const result: InsertOneResult<ImageData> = await new MongoCollection(instance(collectionMock)).addData(imageData);

    expect(result.acknowledged).toBeFalsy();
  });

  test('all::successful', async () => {
    const imageData: ImageData = getImageData(0);
    const expected: WithId<ImageData> = {
      _id: ObjectId.createFromTime(new Date().getTime()),
      chatId: imageData.chatId,
      filePath: imageData.filePath,
      messageId: imageData.messageId,
    };
    when(collectionMock.find(deepEqual({ chatId: 0 }))).thenReturn(instance(findCursor));
    when(findCursor.toArray()).thenReturn(Promise.resolve([expected]));

    const result = await new MongoCollection(instance(collectionMock)).getAll(0);

    expect(result[0]).toEqual(expected);
  });

  test('all::fail', async () => {
    const imageData: ImageData = getImageData(0);
    const expected: WithId<ImageData> = {
      _id: ObjectId.createFromTime(new Date().getTime()),
      chatId: imageData.chatId,
      filePath: imageData.filePath,
      messageId: imageData.messageId,
    };
    when(collectionMock.find(deepEqual({ chatId: 0 }))).thenThrow(new Error);
    when(findCursor.toArray()).thenReturn(Promise.resolve([expected]));

    const result = await new MongoCollection(instance(collectionMock)).getAll(0);

    expect(result).toEqual([]);
  });
});
