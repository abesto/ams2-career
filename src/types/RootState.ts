import { ExportReminderState } from 'app/components/ExportReminder/slice/types';
import { MainPageState } from 'app/pages/MainPage/slice/types';
import { CareerState } from 'app/slices/CareerSlice/types';
import { ChangelogState } from 'app/slices/ChangelogSlice/types';
import { ConnectivityState } from 'app/slices/ConnectivitySlice/types';
import { CookieConsentState } from 'app/slices/CookieConsentSlice/types';
import { SaveMetaState } from 'app/slices/SaveMetaSlice/types';
import { SettingsState } from 'app/slices/SettingsSlice/types';
import { WelcomeState } from 'app/slices/WelcomeSlice/types';

// [IMPORT NEW CONTAINERSTATE ABOVE] < Needed for generating containers seamlessly

/* 
  Because the redux-injectors injects your reducers asynchronously somewhere in your code
  You have to declare them here manually
*/
export interface RootState {
  career?: CareerState;
  mainPage?: MainPageState;
  exportReminder?: ExportReminderState;
  saveMeta?: SaveMetaState;
  welcome?: WelcomeState;
  connectivity?: ConnectivityState;
  changelog?: ChangelogState;
  settings?: SettingsState;
  cookieConsent?: CookieConsentState;
  // [INSERT NEW REDUCER KEY ABOVE] < Needed for generating containers seamlessly
}
