import { describe, expect, it } from 'vitest';

/** Mirrors service rule: exactly one of cityId or regionId */
function isValidSubscription(item: { cityId?: string; regionId?: string }) {
  const hasCity = Boolean(item.cityId);
  const hasRegion = Boolean(item.regionId);
  return (hasCity || hasRegion) && !(hasCity && hasRegion);
}

describe('UserNotificationRegion subscription shape', () => {
  it('accepts city-only and region-only rows', () => {
    expect(isValidSubscription({ cityId: 'c1' })).toBe(true);
    expect(isValidSubscription({ regionId: 'r1' })).toBe(true);
  });

  it('rejects both or neither', () => {
    expect(isValidSubscription({})).toBe(false);
    expect(isValidSubscription({ cityId: 'c1', regionId: 'r1' })).toBe(false);
  });
});
