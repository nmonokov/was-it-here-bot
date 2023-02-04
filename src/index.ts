import dotenv from 'dotenv';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { property } from './utils/property';
import { WebHookServer } from './server/express';
import { DbClient } from './server/mongo';
import { CheckCommand } from './command/check';
import { PersistCommand } from './command/persist';

dotenv.config();
const BOT_TOKEN: string = property('BOT_TOKEN');
const APPLICATION_URL: string = property('APPLICATION_URL');
const EXPRESS_PORT: string = property('EXPRESS_PORT');
const DB_USERNAME: string = property('DB_USERNAME');
const DB_PASSWORD: string = property('DB_PASSWORD');
const DB_CLUSTER_ID: string = property('DB_CLUSTER_ID');
const DB_NAME: string = property('DB_NAME', 'telegram-bots');
const DB_COLLECTION_NAME: string = property('DB_COLLECTION_NAME', 'was-it-here-collection');
const INDEX_TTL_MONTH: string = property('INDEX_TTL_MONTH', 3);
const IMAGE_SIMILARITY_THRESHOLD: number = Number(property('IMAGE_SIMILARITY_THRESHOLD', 500));

const bot = new TelegramBot(BOT_TOKEN);
const dbClient: DbClient = DbClient.Builder
  .username(DB_USERNAME)
  .password(DB_PASSWORD)
  .clusterId(DB_CLUSTER_ID)
  .ttlMonth(INDEX_TTL_MONTH)
  .build();
WebHookServer.Builder
  .url(APPLICATION_URL)
  .port(EXPRESS_PORT)
  .token(BOT_TOKEN)
  .bot(bot)
  .build()
.start();

/** Handling bot commands */

const check: CheckCommand = new CheckCommand(bot, dbClient, IMAGE_SIMILARITY_THRESHOLD, BOT_TOKEN);
const persist: PersistCommand = new PersistCommand(bot, dbClient);

bot.onText(/\/bayan/, async (message: Message) => {
  await check.execute(message);
});

bot.on('message', async (message: Message) => {
  await persist.execute(message);
});
