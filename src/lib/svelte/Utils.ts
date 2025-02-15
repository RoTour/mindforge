import { browser } from '$app/environment';

export type AddCss = {
	class?: string;
};

export const hideEffect = (fn: () => unknown) => {
	setTimeout(fn, 0);
}

export const isOnMobile = () => browser ? window.innerWidth < 768 : false;