// Ishga tushirish: .env -> createRealtimeServer (server.js) -> PORT; SIGTERM/SIGINT'da faol qo'ng'iroqlar yakunlanadi.
require('dotenv').config();
const { createRealtimeServer } = require('./server');
const rt = createRealtimeServer({ env: process.env });
rt.listen();
['SIGTERM', 'SIGINT'].forEach((sig) => process.once(sig, () => rt.shutdown('server_shutdown').finally(() => process.exit(0))));
