import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { socketioPlugin } from './src/lib/socket_plugin';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), socketioPlugin],
	server: {
		allowedHosts: ['abyss', 'translaitor.thewhale.fr']
	}
});
