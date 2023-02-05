import TelegramBot, { Message, PhotoSize } from 'node-telegram-bot-api';

/**
 * Class for defining possible bot commands.
 */
export abstract class ParentCommand<T> {
  protected readonly _bot: TelegramBot;
  protected readonly _collection: T;

  protected constructor(bot: TelegramBot, collection: T) {
    this._bot = bot;
    this._collection = collection;
  }

  abstract execute(message: Message): void;

  protected getMiddleSizeImage(photoSizes: PhotoSize[]): PhotoSize {
    const sortedPhotoSizes = photoSizes
      .filter((photo: PhotoSize) => photo.file_size)
      .sort((firstPhoto: any, secondPhoto: any) => firstPhoto.file_size - secondPhoto.file_size);
    const middleIndex = Math.floor(sortedPhotoSizes.length / 2);
    return sortedPhotoSizes[middleIndex];
  }
}
