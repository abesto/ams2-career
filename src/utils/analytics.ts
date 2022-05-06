import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { createMiddleware } from 'redux-beacon';

import GoogleAnalyticsGtag, {
  trackEvent,
  trackPageView,
} from '@redux-beacon/google-analytics-gtag';
import logger from '@redux-beacon/logger';
import OfflineWeb from '@redux-beacon/offline-web';

import { selectOnline } from 'app/slices/ConnectivitySlice/selectors';
import { RaceResult } from 'types/Race';

const category = 'ams2career';

const emitRaceFinished = trackEvent(action => {
  const result = action.payload.raceResult as RaceResult;
  return {
    category,
    action: 'race_result',
    label: result.carId + ' @ ' + result.trackId,
    value: result.position,
  };
});

const emitCareerReset = trackEvent(action => ({
  category,
  action: 'career_reset',
}));

const emitSaveExport = trackEvent(action => ({
  category,
  action: 'save_export',
}));

const emitSaveImport = trackEvent(action => ({
  category,
  action: 'save_import',
}));

const LOCATION_CHANGE_ACTION = 'analytics/LOCATION_CHANGE';
const pageView = trackPageView(action => ({
  path: action.payload.pathname,
  title: document.title,
}));

const eventsMap = {
  'career/recordRaceResult': emitRaceFinished,
  'career/resetCareer': emitCareerReset,
  'exportReminder/recordExport': emitSaveExport,
  LOAD: emitSaveImport,
  [LOCATION_CHANGE_ACTION]: pageView,
};

const trackingId = 'G-P011NS305M';
const ga = GoogleAnalyticsGtag(trackingId);

const offlineStorage = OfflineWeb(selectOnline);
export const gaMiddleware = createMiddleware(eventsMap, ga, {
  logger,
  offlineStorage,
});

export function usePageViews() {
  const location = useLocation();
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch({ type: LOCATION_CHANGE_ACTION, payload: location });
  }, [location, dispatch]);
}
