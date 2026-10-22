// Welcome trial at registration — against in-memory MongoDB.
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

vi.mock('@/lib/telegram', () => ({ sendMessage: vi.fn(async () => ({ ok: true })), getBotUsername: () => 'bot' }));
vi.mock('@/lib/webPush', () => ({ sendPushToUser: vi.fn(async () => {}) }));

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod;
let M, trial, settings, sub;

describeDb('welcome trial (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    await mongoose.connect(mongod.getUri());
    M = await import('@/lib/models');
    trial = await import('./welcomeTrial');
    settings = await import('./settings');
    sub = await import('./subscription');
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    await Promise.all([M.User.deleteMany({}), M.AppSetting.deleteMany({}), M.Notification.deleteMany({})]);
  });

  const makeUser = (phone = '+998900000001') => M.User.create({ phone, password: 'x', name: 'Yangi' });

  it('by default a new user gets 1 month of Premium and a welcome notice; a second call does nothing', async () => {
    const u = await makeUser();
    const out = await trial.grantWelcomeTrial(u);
    expect(out).toMatchObject({ tier: 'premium', months: 1 });

    const fresh = await M.User.findById(u._id);
    expect(fresh.subscriptionTier).toBe('premium');
    expect(fresh.welcomeTrialAt).toBeInstanceOf(Date);
    const state = sub.subscriptionState(fresh);
    expect(state.status).toBe('active');
    expect(state.daysLeft).toBeGreaterThanOrEqual(28);
    expect(await M.Notification.countDocuments({ userId: u._id, type: 'gift' })).toBe(1);

    expect(await trial.grantWelcomeTrial(fresh)).toBeNull();
    expect(await M.Notification.countDocuments({ userId: u._id })).toBe(1);
  });

  it('admin turns it off → nothing is granted; changes tier/term → that is granted', async () => {
    await settings.setWelcomeTrial({ enabled: false, tier: 'premium', months: 1 });
    const u1 = await makeUser('+998900000002');
    expect(await trial.grantWelcomeTrial(u1)).toBeNull();
    expect((await M.User.findById(u1._id)).subscriptionTier).toBe('free');

    await settings.setWelcomeTrial({ enabled: true, tier: 'standard', months: 3 });
    const u2 = await makeUser('+998900000003');
    expect(await trial.grantWelcomeTrial(u2)).toMatchObject({ tier: 'standard', months: 3 });
    const fresh = await M.User.findById(u2._id);
    expect(fresh.subscriptionTier).toBe('standard');
    expect(sub.subscriptionState(fresh).daysLeft).toBeGreaterThan(85);
  });

  it('a corrupt stored value falls back to the default', async () => {
    await M.AppSetting.create({ key: 'welcomeTrial', value: { enabled: true, tier: 'gold', months: 1 } });
    expect(await settings.getWelcomeTrial()).toEqual(settings.WELCOME_TRIAL_DEFAULT);
  });
});
