import { ExportReminderState } from 'app/components/ExportReminder/slice/types';
import { MainPageState } from 'app/pages/MainPage/slice/types';
import { CareerState } from 'app/slices/CareerSlice/types';
import { SaveMetaState } from 'app/slices/SaveMetaSlice/types';

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
  // [INSERT NEW REDUCER KEY ABOVE] < Needed for generating containers seamlessly
}
