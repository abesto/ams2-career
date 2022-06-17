// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

//import 'react-app-polyfill/stable';
//import 'jest-styled-components';

// Mock out Math.random to be deterministic
beforeEach(() => {
  let n = 0.1;
  jest.spyOn(global.Math, 'random').mockImplementation(() => {
    n = (n + 0.1) % 1;
    return n;
  });
});

export {};
