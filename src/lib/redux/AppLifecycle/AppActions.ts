import { createAction } from '@reduxjs/toolkit';

export const APP_OPENED = 'APP_OPENED';
export const APP_CLOSED = 'APP_CLOSED';

export const AppOpened = createAction<void>(APP_OPENED);
export const AppClosed = createAction<void>(APP_CLOSED);
