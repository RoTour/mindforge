import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from env.loadtest
const envPath = path.resolve(process.cwd(), 'env.loadtest');
const result = dotenv.config({ path: envPath, override: true });

if (result.error) {
	console.error('Error loading env.loadtest:', result.error);
	process.exit(1);
}

console.log('Loaded environment from env.loadtest');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

if (!process.env.DATABASE_URL?.includes('loadtest')) {
    console.error('DATABASE_URL does not seem to be a loadtest database. Aborting for safety.');
    process.exit(1);
}

try {
	console.log('Running prisma db push...');
	execSync('bun prisma db push', {
		stdio: 'inherit',
		env: { ...process.env }
	});
	console.log('Database setup complete.');
} catch (error) {
	console.error('Error setting up database:', error);
	process.exit(1);
}
