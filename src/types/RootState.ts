import { CareerState } from 'app//slice/types';
import { MainPageState } from 'app/pages/MainPage/slice/types';

// [IMPORT NEW CONTAINERSTATE ABOVE] < Needed for generating containers seamlessly

/* 
  Because the redux-injectors injects your reducers asynchronously somewhere in your code
  You have to declare them here manually
*/
export interface RootState {
  career?: CareerState;
  mainPage?: MainPageState;
  // [INSERT NEW REDUCER KEY ABOVE] < Needed for generating containers seamlessly
}
