import TelegramBot, { Message, PhotoSize } from 'node-telegram-bot-api';
import { DbClient } from '../server/mongo';

/**
 * Class for defining possible bot commands.
 */
export abstract class ParentCommand {
  protected readonly bot: TelegramBot;
  protected readonly dbClient: DbClient

  protected constructor(bot: TelegramBot, dbClient: DbClient) {
    this.bot = bot;
    this.dbClient = dbClient;
  }

  abstract execute(message: Message): void;

  protected getMiddleSizeImage(photoSizes: PhotoSize[]): PhotoSize {
    const sortedPhotoSizes = photoSizes
      .filter((photo: PhotoSize) => photo.file_size)
      .sort((a: any, b: any) => a.file_size - b.file_size);
    const middleIndex = Math.floor(sortedPhotoSizes.length / 2);
    return sortedPhotoSizes[middleIndex];
  }
}
