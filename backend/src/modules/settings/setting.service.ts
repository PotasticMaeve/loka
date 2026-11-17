import { prisma } from '../../lib/prisma.js';
import type { UpdateSettingInput } from './setting.schema.js';

// There is only ever one settings row (id = 1).
const SETTINGS_ID = 1;

export const DEFAULT_SETTINGS = {
  openHour: 9,
  closeHour: 21,
  timezone: 'Asia/Jakarta',
} as const;

// Creates the row on first read, so the API works even before seeding.
export function getSettings() {
  return prisma.setting.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...DEFAULT_SETTINGS },
    update: {},
  });
}

export async function updateSettings(input: UpdateSettingInput) {
  await getSettings();

  return prisma.setting.update({
    where: { id: SETTINGS_ID },
    data: input,
  });
}
