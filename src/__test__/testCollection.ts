import { DbCollection } from '../server/dbCollection';
import { InsertOneResult, ObjectId } from 'mongodb';
import { ImageData } from '../model';

export class TestCollection extends DbCollection<any> {
  constructor() {
    const collection: { [chatId: string]: ImageData[] } = {};
    super(collection);
  }
  async addData(imageData: ImageData): Promise<InsertOneResult<ImageData>> {
    if (!this._collection[String(imageData.chatId)]) {
      this._collection[String(imageData.chatId)] = [];
    }
    const number = this._collection[String(imageData.chatId)].push(imageData);
    return Promise.resolve({
      acknowledged: number > 0,
      insertedId: ObjectId.createFromTime(new Date().getTime()),
    });
  }

  async getAll(chatId: number): Promise<ImageData[]> {
    return Promise.resolve(this._collection[chatId]);
  }

  dropAll(): void {
    Object.keys(this._collection).forEach((key: string) => {
      delete this._collection[key];
    })
  };
}
