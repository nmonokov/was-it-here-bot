import TelegramBot, { Message, PhotoSize } from 'node-telegram-bot-api';
import { instance, mock, reset, when } from 'ts-mockito';
import { TestCollection } from '../testCollection';
import { getImages, getMessage } from '../utils';
import { PersistCommand } from '../../command/persist';
import { ImageData } from '../../model';

describe('persist command test', () => {
  const botMock: TelegramBot = mock(TelegramBot);
  const collection: TestCollection = new TestCollection();

  afterEach(() => {
    reset(botMock);
    collection.dropAll();
  });

  test('persist::successful', async () => {
    const images: PhotoSize[] = getImages();
    const middleImage = images[1];
    const message: Message = getMessage(images);
    const expectedFileInfo = {
      file_unique_id: middleImage.file_unique_id,
      file_size: middleImage.file_size,
      file_id: middleImage.file_id,
      file_path: 'comparable/file/path',
    };
    when(await botMock.getFile('file_2')).thenReturn(expectedFileInfo);

    await new PersistCommand(instance(botMock), collection)
      .execute(message);

    const imageData: ImageData = (await collection.getAll(message.chat.id))[0];
    delete imageData.created;
    expect(imageData).toEqual({
      chatId: message.chat.id,
      messageId: message.message_id,
      filePath: expectedFileInfo.file_path,
    });
  });

  test('persist::fail image with file path', async () => {
    const images: PhotoSize[] = getImages();
    const middleImage = images[1];
    const message: Message = getMessage(images);
    const expectedFileInfo = {
      file_unique_id: middleImage.file_unique_id,
      file_size: middleImage.file_size,
      file_id: middleImage.file_id,
    };
    when(await botMock.getFile('file_2')).thenReturn(expectedFileInfo);

    await new PersistCommand(instance(botMock), collection)
      .execute(message);

    const data: ImageData[] = await collection.getAll(message.chat.id);
    expect(data).toEqual(undefined);
  });

  test('persist::fail no image', async () => {
    const message: Message = getMessage();

    await new PersistCommand(instance(botMock), collection)
      .execute(message);

    const data: ImageData[] = await collection.getAll(message.chat.id);
    expect(data).toEqual(undefined);
  });

  test('persist::fail text is command', async () => {
    const message: Message = getMessage();
    message.text = '/command';

    await new PersistCommand(instance(botMock), collection)
      .execute(message);

    const data: ImageData[] = await collection.getAll(message.chat.id);
    expect(data).toEqual(undefined);
  });
});
