import { createEnv } from '@t3-oss/env-nextjs';
import { keys as core } from '@zephyr/next/keys';

export const env = createEnv({
  extends: [core],
  server: {},
  client: {},
  runtimeEnv: {},
});
