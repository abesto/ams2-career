import * as React from 'react';
import GitInfo from 'react-git-info/macro';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { createMiddleware } from 'redux-beacon';

import GoogleAnalyticsGtag, {
  trackEvent,
  trackPageView,
} from '@redux-beacon/google-analytics-gtag';
// import logger from '@redux-beacon/logger';
import OfflineWeb from '@redux-beacon/offline-web';

import { getCarClass } from 'app/data/car_classes';
import { getCar } from 'app/data/cars';
import { getTrack } from 'app/data/tracks';
import { AIAdjustment } from 'app/pages/MainPage/slice/types';
import { selectOnline } from 'app/slices/ConnectivitySlice/selectors';
import { getDisciplineId } from 'types/Discipline';
import { getDisciplineOfRace, RaceResult } from 'types/Race';

const category = 'ams2career';

const gitInfo = GitInfo();

const staticDimensions = {
  commit_hash: gitInfo.commit.hash,
  commit_date: gitInfo.commit.date,
};
const raceResultDimensions: { [key: string]: (result: RaceResult) => string } =
  {
    discipline: (result: RaceResult) => getDisciplineOfRace(result).name,
    car_class: (result: RaceResult) => getCarClass(result.carClassId).name,
    car: (result: RaceResult) => getCar(result.carId).name,
    track: (result: RaceResult) => getTrack(result.trackId).name,
    track_configuration: (result: RaceResult) =>
      getTrack(result.trackId).configuration,
  };

const staticMetrics = {};
const raceResultMetrics: {
  [key: string]: (result: RaceResult, ai: AIAdjustment) => number;
} = {
  ai_final: (result: RaceResult) => result.aiLevel,
  ai_adj_global: (_, ai: AIAdjustment) => ai.global,
  ai_adj_discipline: (result: RaceResult, ai: AIAdjustment) =>
    ai.discipline[getDisciplineId(getDisciplineOfRace(result))],
  ai_adj_carclass: (result: RaceResult, ai: AIAdjustment) =>
    ai.carClass[result.carClassId],
  ai_adj_car: (result: RaceResult, ai: AIAdjustment) => ai.car[result.carId],
};

function buildPageViewFieldsObjectFragment(
  prefix: string,
  staticFields: { [key: string]: string },
  dynamicFields: { [key: string]: unknown },
): { [key: string]: string } {
  const fragment = { ...staticFields };
  let count = 1;
  [...Object.keys(staticFields), ...Object.keys(dynamicFields)].forEach(key => {
    if (count > 20) {
      throw new Error(`Too many ${prefix} fragment`);
    }
    fragment[`${prefix}${count}`] = key;
    count++;
  });
  return fragment;
}

function buildRaceResultFieldsObject(
  result: RaceResult,
  ai: AIAdjustment | null,
): { [key: string]: string | number } {
  return Object.fromEntries([
    ...Object.entries(raceResultDimensions).map(([key, fn]) => [
      key,
      fn(result),
    ]),
    ...Object.entries(raceResultMetrics).map(([key, fn]) => [
      key,
      ai === null ? 0 : fn(result, ai),
    ]),
  ]);
}

const LOCATION_CHANGE_ACTION = 'analytics/LOCATION_CHANGE';
const pageView = trackPageView(action => ({
  path: action.payload.pathname,
  title: document.title,
  fieldsObject: {
    ...buildPageViewFieldsObjectFragment(
      'dimension',
      staticDimensions,
      raceResultDimensions,
    ),
    ...buildPageViewFieldsObjectFragment(
      'metric',
      staticMetrics,
      raceResultMetrics,
    ),
  },
}));

const emitRaceFinished = trackEvent(action => {
  const result = action.payload.raceResult as RaceResult;
  const aiAdjustment = action.payload.aiAdjustment as AIAdjustment | null;
  return {
    category,
    action: 'race_result',
    label: result.carId + ' @ ' + result.trackId,
    value: result.position,
    fieldsObject: buildRaceResultFieldsObject(result, aiAdjustment),
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
  // logger,
  offlineStorage,
});

export function usePageViews() {
  const location = useLocation();
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch({ type: LOCATION_CHANGE_ACTION, payload: location });
  }, [location, dispatch]);
}
