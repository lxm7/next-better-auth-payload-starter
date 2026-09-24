import * as migration_20260924_110837_initial from './20260924_110837_initial';
import * as migration_20260924_121238_content_models from './20260924_121238_content_models';

export const migrations = [
  {
    up: migration_20260924_110837_initial.up,
    down: migration_20260924_110837_initial.down,
    name: '20260924_110837_initial',
  },
  {
    up: migration_20260924_121238_content_models.up,
    down: migration_20260924_121238_content_models.down,
    name: '20260924_121238_content_models'
  },
];
