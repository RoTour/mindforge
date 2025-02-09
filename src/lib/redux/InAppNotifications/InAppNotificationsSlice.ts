// @redux/InAppNotifications/InAppNotificationsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type InAppNotification = {
	id: string;
	message: string;
	type: 'success' | 'error';
};

type InAppNotificationsState = {
	notifications: InAppNotification[];
};

const initialState: InAppNotificationsState = {
	notifications: []
};

export const InAppNotificationsSlice = createSlice({
	name: 'inAppNotifications',
	initialState,
	reducers: {
		notificationAdded: (state, action: PayloadAction<InAppNotification>) => {
			state.notifications.push(action.payload);
		},
		notificationRemoved: (state, action: PayloadAction<string>) => {
			state.notifications = state.notifications.filter((n) => n.id !== action.payload);
		}
	}
});

export const { notificationAdded, notificationRemoved } = InAppNotificationsSlice.actions;
