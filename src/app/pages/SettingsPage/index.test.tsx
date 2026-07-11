import * as React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { vi } from 'vitest';

import { configureAppStore } from 'store/configureStore';

import { SettingsPage } from './index';

const mockSetCookieConsentValue = vi.fn();

vi.mock('app/components/OurCookieConsent', () => ({
  GRANTED: 'granted',
  DECLINED: 'declined',
  useCookieConsentValue: () => ['declined', mockSetCookieConsentValue],
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    mockSetCookieConsentValue.mockReset();
  });

  function renderPage(store = configureAppStore()) {
    return {
      store,
      ...render(
        <HelmetProvider>
          <Provider store={store}>
            <SettingsPage />
          </Provider>
        </HelmetProvider>,
      ),
    };
  }

  it('updates settings state through the rendered controls', () => {
    const { getByLabelText, getByText, getAllByRole, store } = renderPage();

    fireEvent.click(getByLabelText(/Enable Cross-Discipline XP/i));
    expect(store.getState().settings?.crossDisciplineGainsEnabled).toBe(false);

    fireEvent.click(getByText('Short Career'));
    expect(store.getState().settings?.xpMultiplier).toBe(1.5);

    fireEvent.change(getAllByRole('spinbutton')[1], {
      target: { value: '0.5' },
    });
    expect(store.getState().settings?.positionXpMultiplier).toBe(0.5);

    fireEvent.click(getByLabelText(/Enable Regenerating Races/i));
    expect(store.getState().settings?.canRegenerateRaces).toBe(true);
  });

  it('resets settings and updates cookie consent from the UI', () => {
    const { getAllByText, getByText, store } = renderPage();

    fireEvent.click(getByText('Short Career'));
    fireEvent.click(getAllByText('Default')[0]);
    expect(store.getState().settings?.xpMultiplier).toBe(1);

    fireEvent.click(getByText('Grant'));
    expect(mockSetCookieConsentValue).toHaveBeenCalledWith('granted');
  });
});
