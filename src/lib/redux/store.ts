// @redux/store.ts
import { questionReducer } from '@modules/Learning/events/QuestionReducer';
import { errorReducer } from '@modules/Stats/events/ErrorReducer';
import { InAppNotificationsMiddleware } from '@redux/InAppNotifications/InAppNotificationsMiddleware';
import { configureStore } from '@reduxjs/toolkit';
import { InAppNotificationsSlice } from './InAppNotifications/InAppNotificationsSlice';
import { appLifecycleReducer } from './AppLifecycle/AppLifecycleReducer';
import { AppLifecycleDebugMiddleware } from './AppLifecycle/AppLifecycleDebugMiddleware';
import { QuestionMiddleware } from '@modules/Learning/events/QuestionMiddleware';

export const store = configureStore({
	reducer: {
		questions: questionReducer,
		errors: errorReducer,
		inApp: InAppNotificationsSlice.reducer,
		appLifecycle: appLifecycleReducer
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			AppLifecycleDebugMiddleware,
			InAppNotificationsMiddleware,
			QuestionMiddleware
		),
	enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(),
	devTools: true
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export type AppStore = typeof store;
