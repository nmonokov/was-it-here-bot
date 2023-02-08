import { ParentCommand } from './parent';
import TelegramBot, { Message, PhotoSize } from 'node-telegram-bot-api';
import { ImageData, Sticker } from '../model';
import { compareImages } from '../image/compare';
import axios, { AxiosResponse } from 'axios';
import { DbCollection } from '../server/dbCollection';
import { Collection } from 'mongodb';
import { logger } from '../utils/logger';

/**
 * /bayan - check command if selected message in reply is an image already occurred in the chat or not.
 *          if message is old then it will be found in the chat and being replied to with 'this' and a sticker.
 *          if message is new then just sticker which means that this image is new will be sent.
 */
export class CheckCommand extends ParentCommand<DbCollection<Collection<ImageData>>> {
  private readonly _imageSimilarityThreshold: number;
  private readonly _fileBasePath: string;

  constructor(
    bot: TelegramBot,
    collection: DbCollection<Collection<ImageData>>,
    imageSimilarityThreshold: number,
    botToken: string,
  ) {
    super(bot, collection);
    this._imageSimilarityThreshold = imageSimilarityThreshold;
    this._fileBasePath = `https://api.telegram.org/file/bot${botToken}`;
  }

  async execute(message: Message): Promise<void> {
    const chatId = message.chat.id;
    const replyToMessage = message.reply_to_message;
    if (!replyToMessage) {
      this._bot.sendMessage(chatId, 'Reply on image you want to check.');
      return;
    }
    if (!replyToMessage.photo) {
      this._bot.sendMessage(chatId, 'Replied message should contain image.');
      return;
    }
    const fileLink: string = await this.fileLink(replyToMessage.photo);
    const sameImage: ImageData | undefined = await this.findSameImage(chatId, replyToMessage, fileLink);
    await this.respond(chatId, sameImage);
  }

  private async fileLink(photoSizes: PhotoSize[]): Promise<string> {
    const middleSizeImage: PhotoSize = this.getMiddleSizeImage(photoSizes);
    return await this._bot.getFileLink(middleSizeImage.file_id);
  }

  private async findSameImage(
    chatId: number,
    replyToMessage: TelegramBot.Message,
    fileLink: string
  ): Promise<ImageData | undefined> {
    const images: ImageData[] = await this._collection.getAll(chatId);
    let sameImage;
    for await (const image of images) {
      if (replyToMessage.message_id !== image.messageId) {
        const imageToCompareUrl: string = `${this._fileBasePath}/${image.filePath}`;
        const firstImageResponse = await axios.get(fileLink, { responseType: 'arraybuffer' });
        let secondImageResponse: AxiosResponse<any>;
        try {
          secondImageResponse = await axios.get(imageToCompareUrl, { responseType: 'arraybuffer' });
        } catch (error) {
          logger.error('Failed to fetch the image', { url: imageToCompareUrl, error })
          continue;
        }
        const isSame = await compareImages(
          firstImageResponse.data,
          secondImageResponse.data,
          this._imageSimilarityThreshold
        );
        if (isSame) {
          sameImage = image;
          break;
        }
      }
    }
    return sameImage;
  }

  private respond(chatId: number, sameImage?: ImageData): void {
    if (sameImage) {
      const options = {
        reply_to_message_id: sameImage.messageId,
      };
      this._bot.sendMessage(chatId, 'this', options);
      this._bot.sendSticker(chatId, Sticker.OLD);
    } else {
      this._bot.sendSticker(chatId, Sticker.NEW);
    }
  }
}
