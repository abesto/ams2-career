// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

//import 'react-app-polyfill/stable';
//import 'jest-styled-components';

beforeEach(() => {
  // Mock out Math.random to be deterministic
  let n = 0.1;
  jest.spyOn(global.Math, 'random').mockImplementation(() => {
    n = (n + 0.1) % 1;
    return n;
  });
});

// Generating race dates is inconsistent (due to floating point inaccuracies?) even with Math.random
// mocked out. Solution: directly mock out randomDateBetween.
jest.mock('app/pages/MainPage/racegen.random', () => {
  const original = jest.requireActual('app/pages/MainPage/racegen.random');
  return {
    ...original,
    randomDateBetween: a => a,
  };
});

export {};
