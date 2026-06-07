import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();

app.listen(config.port, () => {
  console.log(`Bazaar Setu API running on ${config.apiBaseUrl}`);
});
