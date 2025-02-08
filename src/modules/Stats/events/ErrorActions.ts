import { createAction } from '@reduxjs/toolkit';

export const ERROR_HANDLED = 'ERROR_HANDLED';

export const errorHandled = createAction<{ message: string }>('ERROR_HANDLED');