import * as migration_20260924_110837_initial from './20260924_110837_initial';

export const migrations = [
  {
    up: migration_20260924_110837_initial.up,
    down: migration_20260924_110837_initial.down,
    name: '20260924_110837_initial'
  },
];
