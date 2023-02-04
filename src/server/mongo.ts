import { Collection, InsertOneResult, MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import { ImageData } from '../model';
import { logger } from '../utils/logger';

/**
 * The DbClient class is a database client that connects to a MongoDB instance
 * using the provided username, password and cluster ID. The class provides an interface
 * to interact with the database by adding and retrieving data.
 */
export class DbClient {
  private readonly _client: MongoClient;
  private readonly _collection: Collection<ImageData>;
  private readonly _dbName: string;
  private readonly _dbCollectionName: string;

  private constructor(
    username: string,
    password: string,
    clusterId: string,
    dbName: string,
    dbCollectionName: string,
    ttl: number
  ) {
    const uri = `mongodb+srv://${username}:${password}@${clusterId}.mongodb.net/?retryWrites=true&w=majority`;
    this._client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
    this._dbName = dbName;
    this._dbCollectionName = dbCollectionName;
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
      .db(this._dbName)
      .collection(this._dbCollectionName);
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
      logger.error('Failed to fetch data from MongoDB.');
      return [];
    }
  }

  static Builder = class {
    private static _username: string;
    private static _password: string;
    private static _clusterId: string;
    private static _dbName: string;
    private static _dbCollectionName: string;
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

    static dbName(dbName: string) {
      this._dbName = dbName;
      return this;
    }

    static dbCollectionName(dbCollectionName: string) {
      this._dbCollectionName = dbCollectionName;
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
      return new DbClient(
        this._username,
        this._password,
        this._clusterId,
        this._dbName,
        this._dbCollectionName,
        this._ttl,
      );
    }
  };
}
