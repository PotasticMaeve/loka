import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { updateSettingSchema } from './setting.schema.js';
import * as settingService from './setting.service.js';

export const settingRouter = Router();

// Public: the frontend needs the operating hours to render the slot grid.
settingRouter.get('/', async (_req, res) => {
  const settings = await settingService.getSettings();
  res.json({ settings });
});

settingRouter.put(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  validate({ body: updateSettingSchema }),
  async (req, res) => {
    const settings = await settingService.updateSettings(req.body);
    res.json({ settings });
  },
);
