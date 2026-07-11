import { Saga } from 'redux-saga';

import { AnyAction, Reducer } from '@reduxjs/toolkit';

import { RootState } from 'types';

type RequiredRootState = Required<RootState>;

export type RootStateKeyType = keyof RootState;

export enum SagaInjectionModes {
  RESTART_ON_REMOUNT = '@@saga-injector/restart-on-remount',
  DAEMON = '@@saga-injector/daemon',
  ONCE_TILL_UNMOUNT = '@@saga-injector/once-till-unmount',
  COUNTER = '@@saga-injector/counter',
}

export type InjectedReducersType = {
  [P in RootStateKeyType]?: Reducer<RequiredRootState[P], AnyAction>;
};
export interface InjectReducerParams<Key extends RootStateKeyType> {
  key: Key;
  reducer: Reducer<RequiredRootState[Key], AnyAction>;
}

export interface InjectSagaParams {
  key: RootStateKeyType | string;
  saga: Saga;
  mode?: SagaInjectionModes;
}
