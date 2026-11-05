import { MongoMemoryServer } from 'mongodb-memory-server';
const m = await MongoMemoryServer.create({ instance: { port: 27019, dbName: 'vocably_e2e' } });
console.log('MONGO READY', m.getUri());
setInterval(() => {}, 1 << 30);
