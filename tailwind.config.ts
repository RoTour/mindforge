import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				'primary': colors.zinc['300'],
				'contrast-primary': colors.zinc['700'],
				'background': colors.zinc['900'],
				'contrast-background': colors.zinc['100'],
				'surface': colors.zinc['800'],
				'contrast-surface': colors.zinc['200'],
				'accent': colors.emerald['500'],
				'contrast-accent': colors.emerald['900']
			},
			fontFamily: {
				'space-mono': ['Space Mono', 'monospace'],
				'dm-sans': ['DM Sans', 'Helvetica', 'sans-serif'],
				'jetbrains-mono': ['JetBrains Mono', 'monospace']
			}
		}
	},

	plugins: [typography, forms, containerQueries]
} satisfies Config;
