jest.mock('react-cookie-consent', () => ({
  getCookieConsentValue: jest.fn(),
}));

jest.mock('@redux-beacon/google-analytics-gtag', () => ({
  __esModule: true,
  default: jest.fn(() => 'ga'),
  trackEvent: jest.fn(fn => fn),
  trackPageView: jest.fn(fn => fn),
}));

jest.mock('@redux-beacon/offline-web', () => jest.fn(() => 'offline-storage'));

jest.mock('redux-beacon', () => ({
  createMiddleware: jest.fn(),
}));

describe('analytics middleware', () => {
  const { getCookieConsentValue } = jest.requireMock(
    'react-cookie-consent',
  ) as {
    getCookieConsentValue: jest.Mock;
  };
  const reduxBeacon = jest.requireMock('redux-beacon') as {
    createMiddleware: jest.Mock;
  };
  const beaconStoreSpy = jest.fn();
  const beaconMiddleware = (storeApi: unknown) => {
    beaconStoreSpy(storeApi);
    return (next: any) => (action: any) => {
      next(action);
      return 'tracked';
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    reduxBeacon.createMiddleware.mockReturnValue(beaconMiddleware);
  });

  it('builds beacon middleware with the expected event map', () => {
    getCookieConsentValue.mockReturnValue('granted');
    let createGaMiddleware!: typeof import('./analytics').createGaMiddleware;
    jest.isolateModules(() => {
      ({ createGaMiddleware } = require('./analytics'));
    });

    createGaMiddleware();

    expect(reduxBeacon.createMiddleware).toHaveBeenCalledWith(
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
    let createGaMiddleware!: typeof import('./analytics').createGaMiddleware;
    jest.isolateModules(() => {
      ({ createGaMiddleware } = require('./analytics'));
    });
    const next = jest.fn(action => action.type);
    const storeApi = { getState: jest.fn(), dispatch: jest.fn() };
    const action = { type: 'career/resetCareer' };

    getCookieConsentValue.mockReturnValue('declined');
    const middleware = createGaMiddleware();
    const declinedResult = middleware(storeApi as any)(next)(action);
    expect(declinedResult).toBe('career/resetCareer');
    expect(beaconStoreSpy).not.toHaveBeenCalled();

    next.mockClear();
    getCookieConsentValue.mockReturnValue('granted');
    const grantedResult = middleware(storeApi as any)(next)(action);
    expect(grantedResult).toBe('tracked');
    expect(beaconStoreSpy).toHaveBeenCalledWith(storeApi);
    expect(next).toHaveBeenCalledWith(action);
  });
});

export {};
