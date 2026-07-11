import { vi } from 'vitest';

import { getCookieConsentValue } from 'react-cookie-consent';
import { createMiddleware } from 'redux-beacon';

import { createGaMiddleware } from './analytics';

vi.mock('react-cookie-consent', () => ({
  getCookieConsentValue: vi.fn(),
}));

vi.mock('@redux-beacon/google-analytics-gtag', () => ({
  __esModule: true,
  default: vi.fn(() => 'ga'),
  trackEvent: vi.fn(fn => fn),
  trackPageView: vi.fn(fn => fn),
}));

vi.mock('@redux-beacon/offline-web', () => ({
  default: vi.fn(() => 'offline-storage'),
}));

vi.mock('redux-beacon', () => ({
  createMiddleware: vi.fn(),
}));

describe('analytics middleware', () => {
  const mockedGetCookieConsentValue = vi.mocked(getCookieConsentValue);
  const mockedCreateMiddleware = vi.mocked(createMiddleware);
  const beaconStoreSpy = vi.fn();
  const beaconMiddleware = (storeApi: unknown) => {
    beaconStoreSpy(storeApi);
    return (next: any) => (action: any) => {
      next(action);
      return 'tracked';
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedCreateMiddleware.mockReturnValue(beaconMiddleware as any);
  });

  it('builds beacon middleware with the expected event map', () => {
    mockedGetCookieConsentValue.mockReturnValue('granted');

    createGaMiddleware();

    expect(mockedCreateMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({
        'career/recordRaceResult': expect.any(Function),
        'career/resetCareer': expect.any(Function),
        'exportReminder/recordExport': expect.any(Function),
        LOAD: expect.any(Function),
        'analytics/LOCATION_CHANGE': expect.any(Function),
      }),
      'ga',
      { offlineStorage: 'offline-storage' },
    );
  });

  it('gates analytics dispatch on cookie consent', () => {
    const next = vi.fn(action => action.type);
    const storeApi = { getState: vi.fn(), dispatch: vi.fn() };
    const action = { type: 'career/resetCareer' };

    mockedGetCookieConsentValue.mockReturnValue('declined');
    const middleware = createGaMiddleware();
    const declinedResult = middleware(storeApi as any)(next)(action);
    expect(declinedResult).toBe('career/resetCareer');
    expect(beaconStoreSpy).not.toHaveBeenCalled();

    next.mockClear();
    mockedGetCookieConsentValue.mockReturnValue('granted');
    const grantedResult = middleware(storeApi as any)(next)(action);
    expect(grantedResult).toBe('tracked');
    expect(beaconStoreSpy).toHaveBeenCalledWith(storeApi);
    expect(next).toHaveBeenCalledWith(action);
  });
});

export {};
