import { Collection, InsertOneResult, MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import { ImageData } from '../model';
import { logger } from '../utils/logger';

const DEFAULT_DATABASE = 'telegram-bots-test';
const DEFAULT_COLLECTION = 'was-it-here-collection';

/**
 * The DbClient class is a database client that connects to a MongoDB instance
 * using the provided username, password and cluster ID. The class provides an interface
 * to interact with the database by adding and retrieving data.
 */
export class DbClient {
  private readonly _client: MongoClient;
  private readonly _collection: Collection<ImageData>;

  private constructor(username: string, password: string, clusterId: string, ttl: number) {
    const uri = `mongodb+srv://${username}:${password}@${clusterId}.mongodb.net/?retryWrites=true&w=majority`;
    this._client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
    try {
      this._collection = this.connect();
      this._collection.createIndex('chatId');
      this._collection.createIndex('created', { expireAfterSeconds: ttl });
    } catch (error: any) {
      logger.error('Failed to establish connection to MongoDB.', error);
      throw Error(error.message);
    } finally {
      this._client.close();
    }
  }

  private connect(): Collection<ImageData> {
    return this._client
      .db(DEFAULT_DATABASE)
      .collection(DEFAULT_COLLECTION);
  }

  async addData(imageData: ImageData): Promise<InsertOneResult<ImageData>> {
    try {
      return this._collection.insertOne(imageData);
    } catch (error) {
      logger.error('Failed to save data to MongoDB.', error);
      return {
        acknowledged: false,
        insertedId: ObjectId.createFromHexString(''),
      };
    }
  }

  async getAll(chatId: number): Promise<ImageData[]> {
    try {
      return this._collection.find({ chatId }).toArray();
    } catch (error) {
      logger.info('Failed to fetch data from MongoDB.');
      return [];
    }
  }

  static Builder = class {
    private static _username: string;
    private static _password: string;
    private static _clusterId: string;
    private static _ttl: number;

    static username(username: string) {
      this._username = username;
      return this;
    }

    static password(password: string) {
      this._password = password;
      return this;
    }

    static clusterId(clusterId: string) {
      this._clusterId = clusterId;
      return this;
    }

    static ttlMonth(ttlMonth: string) {
      const daysInMonth = 30;
      const hoursInDay = 24;
      const minutesInHour = 60;
      const secondsInMinute = 60;
      this._ttl = Number(ttlMonth) * daysInMonth * hoursInDay * minutesInHour * secondsInMinute;
      return this;
    }

    static build() {
      return new DbClient(this._username, this._password, this._clusterId, this._ttl);
    }
  };
}
