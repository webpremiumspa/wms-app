import 'dotenv/config';
import { createApp } from './src/app.js';
import { config } from './src/config.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`[wms] listening on :${config.port} (env=${config.env})`);
});
