import { createReducer } from '@reduxjs/toolkit';
import { errorHandled } from './ErrorActions';

interface ErrorState {
	message: string;
}

const initialState: ErrorState = {
	message: ''
};

export const errorReducer = createReducer(initialState, (builder) => {
	builder.addCase(errorHandled, (state, action) => {
		state.message = action.payload.message;
	});
})