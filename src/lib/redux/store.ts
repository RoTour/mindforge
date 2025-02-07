import { configureStore } from '@reduxjs/toolkit';
import { questionReducer } from '@modules/Learning/events/QuestionReducer';


export const store = configureStore({
	reducer: {
		questions: questionReducer,
	},
	enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export type AppStore = typeof store;