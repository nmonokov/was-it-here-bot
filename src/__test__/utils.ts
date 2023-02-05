import { Message, PhotoSize } from 'node-telegram-bot-api';
import { ImageData } from '../model';

export const getMessage = (photo?: PhotoSize[], replyToMessage?: Message): Message => ({
  chat: { id: 0, type: 'private' },
  from: { id: 0, is_bot: false, first_name: 'test' },
  date: 0,
  message_id: 0,
  reply_to_message: replyToMessage,
  photo,
});

export const getImages = (): PhotoSize[] => [
  {
    file_id: 'file_1',
    file_size: 100,
    file_unique_id: 'file_1_unique',
    height: 100,
    width: 50,
  },
  {
    file_id: 'file_2',
    file_size: 200,
    file_unique_id: 'file_2_unique',
    height: 200,
    width: 100,
  },
  {
    file_id: 'file_3',
    file_size: 300,
    file_unique_id: 'file_3_unique',
    height: 300,
    width: 150,
  }
];

export const getImageData = (messageId: number): ImageData => ({
  chatId: 0,
  messageId,
  filePath: 'comparable/file/path',
  created: new Date(),
});
