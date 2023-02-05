import { deepEqual, instance, mock, reset, verify } from 'ts-mockito';
import TelegramBot, { Message, PhotoSize } from 'node-telegram-bot-api';
import { TestCollection } from '../testCollection';
import sinon from 'sinon';
import axios from 'axios';
import { CheckCommand } from '../../command/check';
import { getImageData, getImages, getMessage } from '../utils';
import { ImageData, Sticker } from '../../model';
import * as compareImage from '../../image/compare';

describe('check command test', () => {
  const botMock: TelegramBot = mock(TelegramBot);
  const collection: TestCollection = new TestCollection();
  const getStub = sinon.stub(axios, 'get');
  const imageStub = sinon.stub(compareImage, 'compareImages');

  afterEach(() => {
    reset(botMock);
    sinon.reset();
    collection.dropAll();
  });

  test('check::successful image is old', async () => {
    const images: PhotoSize[] = getImages();
    const replyToMessage: Message = getMessage(images);
    const message: Message = getMessage(undefined, replyToMessage);
    const comparableData: ImageData = getImageData(replyToMessage.message_id);
    const dataToCompare: ImageData = getImageData(replyToMessage.message_id + 1);
    await collection.addData(comparableData);
    await collection.addData(dataToCompare);
    getStub.resolves({ data: new Buffer('') });
    imageStub.resolves(true);

    await new CheckCommand(instance(botMock), collection, 500, 'token')
      .execute(message);

    verify(botMock.getFileLink('file_2')).once();
    verify(botMock.sendMessage(replyToMessage.chat.id, 'this', deepEqual({
      reply_to_message_id: replyToMessage.message_id + 1,
    }))).once();
    verify(botMock.sendSticker(replyToMessage.chat.id, Sticker.OLD)).once();
    expect(imageStub.calledOnce).toBeTruthy();
    expect(getStub.calledTwice).toBeTruthy();
  });

  test('check::successful image is new', async () => {
    const images: PhotoSize[] = getImages();
    const replyToMessage: Message = getMessage(images);
    const message: Message = getMessage(undefined, replyToMessage);
    const comparableData: ImageData = getImageData(replyToMessage.message_id);
    const dataToCompare: ImageData = getImageData(replyToMessage.message_id + 1);
    await collection.addData(comparableData);
    await collection.addData(dataToCompare);
    getStub.resolves({ data: new Buffer('') });
    imageStub.resolves(false);

    await new CheckCommand(instance(botMock), collection, 500, 'token')
      .execute(message);

    verify(botMock.getFileLink('file_2')).once();
    verify(botMock.sendMessage(message.chat.id, 'this', deepEqual({
      reply_to_message_id: replyToMessage.message_id + 1,
    }))).never();
    verify(botMock.sendSticker(message.chat.id, Sticker.OLD)).never();
    verify(botMock.sendSticker(message.chat.id, Sticker.NEW)).once();
    expect(imageStub.calledOnce).toBeTruthy();
    expect(getStub.calledTwice).toBeTruthy();
  });

  test('check::successful reply image is the only one present', async () => {
    const images: PhotoSize[] = getImages();
    const replyToMessage: Message = getMessage(images);
    const message: Message = getMessage(undefined, replyToMessage);
    const comparableData: ImageData = getImageData(replyToMessage.message_id);
    await collection.addData(comparableData);

    await new CheckCommand(instance(botMock), collection, 500, 'token')
      .execute(message);

    verify(botMock.getFileLink('file_2')).once();
    verify(botMock.sendMessage(message.chat.id, 'this', deepEqual({
      reply_to_message_id: replyToMessage.message_id + 1,
    }))).never();
    verify(botMock.sendSticker(message.chat.id, Sticker.OLD)).never();
    verify(botMock.sendSticker(message.chat.id, Sticker.NEW)).once();
    expect(imageStub.notCalled).toBeTruthy();
    expect(getStub.notCalled).toBeTruthy();
  });

  test('check::fail no photo in reply message', async () => {
    const replyToMessage: Message = getMessage();
    const message: Message = getMessage(undefined, replyToMessage);

    await new CheckCommand(instance(botMock), collection, 500, 'token')
      .execute(message);

    verify(botMock.sendMessage(message.chat.id, 'Replied message should contain image.')).once();
    expect(imageStub.notCalled).toBeTruthy();
    expect(getStub.notCalled).toBeTruthy();
  });

  test('check::fail no reply message', async () => {
    const message: Message = getMessage();

    await new CheckCommand(instance(botMock), collection, 500, 'token')
      .execute(message);

    verify(botMock.sendMessage(message.chat.id, 'Reply on image you want to check.'));
    expect(imageStub.notCalled).toBeTruthy();
    expect(getStub.notCalled).toBeTruthy();
  });
});
