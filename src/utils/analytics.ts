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

const emitRaceFinished = trackEvent(action => {
  const result = action.payload.raceResult as RaceResult;
  return {
    category: 'RaceFinished',
    action: result.carClassId,
    label: result.carId + ' @ ' + result.trackId,
    value: result.position,
  };
});

const LOCATION_CHANGE_ACTION = 'analytics/LOCATION_CHANGE';
const pageView = trackPageView(action => ({
  path: action.payload.pathname,
  title: document.title,
}));

const eventsMap = {
  'career/recordRaceResult': emitRaceFinished,
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
