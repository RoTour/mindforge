// @redux/InAppNotifications/InAppNotificationsMiddleware.ts
import { errorHandled } from '@modules/Stats/events/ErrorActions';
import { type Middleware } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import { notificationAdded } from './InAppNotificationsSlice';

export const InAppNotificationsMiddleware: Middleware = store => next => action => {
	const result = next(action);

	// If an error happened, show an error notification
	if (errorHandled.match(action)) {
		store.dispatch(
			notificationAdded({
				id: uuid(),
				message: action.payload.message,
				type: 'error'
			})
		);
	}

	return result;
};
