import { Collection, InsertOneResult, ObjectId } from 'mongodb';
import { ImageData } from '../model';
import { logger } from '../utils/logger';
import { DbCollection } from './dbCollection';

/**
 * Class wrapper for MongoDB Collection.
 */
export class MongoCollection extends DbCollection<Collection<ImageData>> {

  constructor(collection: Collection<ImageData>) {
    super(collection);
  }

  async addData(imageData: ImageData): Promise<InsertOneResult<ImageData>> {
    try {
      return this._collection.insertOne(imageData);
    } catch (error) {
      logger.error('Failed to save data to MongoDB.', error);
      return {
        acknowledged: false,
        insertedId: ObjectId.createFromHexString('000000000000000000000000'),
      };
    }
  }

  async getAll(chatId: number): Promise<ImageData[]> {
    try {
      return this._collection.find({ chatId }).toArray();
    } catch (error) {
      logger.error('Failed to fetch data from MongoDB.');
      return [];
    }
  }

}
