import { ParentCommand } from './parent';
import TelegramBot from 'node-telegram-bot-api';
import { DbClient } from '../server/mongo';
import { ImageData } from '../model';
import { InsertOneResult } from 'mongodb';
import { logger } from '../utils/logger';

/**
 * Persists all images sent to the chat as
 *  chatId - to define in what chat this image occured
 *  messageId - a message to reply to when the image be found
 *  filePath - the path to image file in the telegram server
 */
export class PersistCommand extends ParentCommand {
  constructor(bot: TelegramBot, dbClient: DbClient) {
    super(bot, dbClient);
  }

  async execute(message: TelegramBot.Message): Promise<void> {
    logger.info(message);
    if (message.text?.startsWith('/')) {
      return;
    }
    if (!message.photo) {
      return;
    }
    const middleSizeImage = this.getMiddleSizeImage(message.photo);
    const fileInfo = await this.bot.getFile(middleSizeImage.file_id);
    if (fileInfo.file_path) {
      const imageData: ImageData = {
        chatId: message.chat.id,
        messageId: message.message_id,
        filePath: fileInfo.file_path,
        created: new Date(),
      }
      const addedData: InsertOneResult<ImageData> = await this.dbClient.addData(imageData);
      if (addedData.acknowledged) {
        logger.debug(`Entry: ${addedData.insertedId} saved.`);
      } else {
        logger.debug('Failed to save the entry', { imageData });
      }
    }
  }
}
