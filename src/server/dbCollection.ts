import { ImageData } from '../model';
import { InsertOneResult } from 'mongodb';

export abstract class DbCollection<T> {
  protected readonly _collection: T;

  protected constructor(collection: T) {
    this._collection = collection;
  }

  abstract addData(imageData: ImageData): Promise<InsertOneResult<ImageData>>;

  abstract getAll(chatId: number): Promise<ImageData[]>;

}
