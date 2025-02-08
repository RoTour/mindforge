// @redux/store.ts
import { questionReducer } from '@modules/Learning/events/QuestionReducer';
import { errorReducer } from '@modules/Stats/events/ErrorReducer';
import { InAppNotificationsMiddleware } from '@redux/InAppNotifications/InAppNotificationsMiddleware';
import { configureStore } from '@reduxjs/toolkit';
import { InAppNotificationsSlice } from './InAppNotifications/InAppNotificationsSlice';

export const store = configureStore({
	reducer: {
		questions: questionReducer,
		errors: errorReducer,
		inApp: InAppNotificationsSlice.reducer
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(InAppNotificationsMiddleware),
	enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export type AppStore = typeof store;