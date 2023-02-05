import { ParentCommand } from './parent';
import TelegramBot, { PhotoSize, File } from 'node-telegram-bot-api';
import { ImageData } from '../model';
import { Collection, InsertOneResult } from 'mongodb';
import { logger } from '../utils/logger';
import { DbCollection } from '../server/dbCollection';

/**
 * Persists all images sent to the chat as
 *  chatId - to define in what chat this image occured
 *  messageId - a message to reply to when the image be found
 *  filePath - the path to image file in the telegram server
 */
export class PersistCommand extends ParentCommand<DbCollection<Collection<ImageData>>> {
  constructor(bot: TelegramBot, collection: DbCollection<Collection<ImageData>>) {
    super(bot, collection);
  }

  async execute(message: TelegramBot.Message): Promise<void> {
    logger.debug(message);
    if (message.text?.startsWith('/')) {
      return;
    }
    if (!message.photo) {
      return;
    }
    const middleSizeImage: PhotoSize = this.getMiddleSizeImage(message.photo);
    const fileInfo: File = await this._bot.getFile(middleSizeImage.file_id);
    if (fileInfo.file_path) {
      const imageData: ImageData = {
        chatId: message.chat.id,
        messageId: message.message_id,
        filePath: fileInfo.file_path,
        created: new Date(),
      };
      const addedData: InsertOneResult<ImageData> = await this._collection.addData(imageData);
      if (addedData.acknowledged) {
        logger.debug(`Entry: ${addedData.insertedId} saved.`);
      } else {
        logger.debug('Failed to save the entry', { imageData });
      }
    }
  }
}
