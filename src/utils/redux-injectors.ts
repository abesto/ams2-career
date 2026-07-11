import { useLayoutEffect } from 'react';
import { useStore } from 'react-redux';
import {
  Reducer,
  Store,
  StoreEnhancer,
  StoreEnhancerStoreCreator,
} from 'redux';
import { Saga, Task } from 'redux-saga';

import {
  InjectReducerParams,
  InjectSagaParams,
  InjectedReducersType,
  RootStateKeyType,
  SagaInjectionModes,
} from './types/injector-typings';

export { SagaInjectionModes } from './types/injector-typings';

type InjectedSagaDescriptor = {
  saga: Saga;
  task: Task;
  mode: SagaInjectionModes;
  count: number;
};

type InjectedSagasType = Record<string, InjectedSagaDescriptor | 'done'>;

type CreateReducer = (injectedReducers: InjectedReducersType) => Reducer;
type RunSaga = (saga: Saga, ...args: any[]) => Task;

type InjectorStore = Store & {
  createReducer: CreateReducer;
  runSaga: RunSaga;
  injectedReducers: InjectedReducersType;
  injectedSagas: InjectedSagasType;
};

function injectReducer<Key extends RootStateKeyType>(
  store: InjectorStore,
  { key, reducer }: InjectReducerParams<Key>,
) {
  if (store.injectedReducers[key] === reducer) {
    return;
  }

  store.injectedReducers[key] = reducer as InjectedReducersType[Key];
  store.replaceReducer(store.createReducer(store.injectedReducers));
}

function injectSaga(
  store: InjectorStore,
  { key, saga, mode = SagaInjectionModes.DAEMON }: InjectSagaParams,
) {
  const current = store.injectedSagas[key];

  if (mode === SagaInjectionModes.COUNTER) {
    if (current && current !== 'done') {
      current.count += 1;
      return;
    }

    store.injectedSagas[key] = {
      saga,
      mode,
      count: 1,
      task: store.runSaga(saga),
    };
    return;
  }

  if (current && current !== 'done') {
    if (
      current.saga === saga &&
      (mode === SagaInjectionModes.DAEMON ||
        mode === SagaInjectionModes.ONCE_TILL_UNMOUNT)
    ) {
      return;
    }

    current.task.cancel();
  }

  if (mode === SagaInjectionModes.ONCE_TILL_UNMOUNT && current === 'done') {
    return;
  }

  store.injectedSagas[key] = {
    saga,
    mode,
    count: 0,
    task: store.runSaga(saga),
  };
}

function ejectSaga(store: InjectorStore, key: string) {
  const current = store.injectedSagas[key];
  if (!current || current === 'done') {
    return;
  }

  if (current.mode === SagaInjectionModes.DAEMON) {
    return;
  }

  if (current.mode === SagaInjectionModes.COUNTER) {
    current.count -= 1;
    if (current.count > 0) {
      return;
    }

    current.task.cancel();
    delete store.injectedSagas[key];
    return;
  }

  current.task.cancel();
  if (current.mode === SagaInjectionModes.ONCE_TILL_UNMOUNT) {
    store.injectedSagas[key] = 'done';
  } else {
    delete store.injectedSagas[key];
  }
}

/* Local compatibility layer for dynamic reducer/saga injection */

export function createInjectorsEnhancer({
  createReducer,
  runSaga,
}: {
  createReducer: CreateReducer;
  runSaga: RunSaga;
}): StoreEnhancer {
  return ((createStore: StoreEnhancerStoreCreator) =>
    (...args: Parameters<typeof createStore>) => {
      const store = createStore(...args) as unknown as InjectorStore;

      return {
        ...store,
        createReducer,
        runSaga,
        injectedReducers: {},
        injectedSagas: {},
      };
    }) as StoreEnhancer;
}

export function useInjectReducer<Key extends RootStateKeyType>(
  params: InjectReducerParams<Key>,
) {
  const { key, reducer } = params;
  const store = useStore() as InjectorStore;

  useLayoutEffect(() => {
    injectReducer(store, { key, reducer });
  }, [key, reducer, store]);

  return store.injectedReducers[key] === reducer;
}

export function useInjectSaga(params: InjectSagaParams) {
  const { key, mode, saga } = params;
  const store = useStore() as InjectorStore;

  useLayoutEffect(() => {
    injectSaga(store, {
      key,
      mode: mode ?? SagaInjectionModes.COUNTER,
      saga,
    });

    return () => {
      ejectSaga(store, key);
    };
  }, [key, mode, saga, store]);

  const injected = store.injectedSagas[key];
  return (
    injected !== undefined && injected !== 'done' && injected.saga === saga
  );
}
