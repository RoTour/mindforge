// /Users/rotour/projects/mindforge/src/quiz-context/infra/ImageStudentListParser.int.test.ts
import { describe, it, expect } from 'vitest';
import { ImageStudentListParser } from './ImageStudentListParser';
import * as fs from 'fs';
import * as path from 'path';
import { env } from '$env/dynamic/private';

describe('ImageStudentListParser integration tests', () => {
	// This integration test makes a real API call and will be skipped if the API key is not provided.
	const itif = (condition: boolean) => (condition ? it : it.skip);

	itif(!!env.OPENROUTER_API_KEY)(
		'should parse student data from a test image',
		async () => {
			const parser = new ImageStudentListParser();
			const imagePath = path.resolve(process.cwd(), 'test/example_promotion.png');

			// 1. Check if the test file exists
			if (!fs.existsSync(imagePath)) {
				throw new Error(`Test image not found at path: ${imagePath}`);
			}

			// 2. Read the file and create a File object for the parser
			const buffer = fs.readFileSync(imagePath);
			const file = new File([buffer], 'example_promotion.png', { type: 'image/png' });

			// 3. Call the parser
			const students = await parser.parse(file);

			// 4. Assert the structure of the result
			expect(students).toBeDefined();
			expect(Array.isArray(students)).toBe(true);
			expect(students.length).toBeGreaterThan(0);

			// Check the structure of the first student object
			const firstStudent = students[0];
			expect(firstStudent).toHaveProperty('name');
			expect(typeof firstStudent.name).toBe('string');
			expect(firstStudent.name.length).toBeGreaterThan(0);

			// The 'lastName' and 'email' properties are optional, so we don't assert their presence.
			// We just check that if they exist, they are strings.
			if (firstStudent.lastName) {
				expect(typeof firstStudent.lastName).toBe('string');
			}
			if (firstStudent.email) {
				expect(typeof firstStudent.email).toBe('string');
			}

			console.log('Parsed students:', students);

			// 5. Assert the content of the result
			// TODO: For a more robust test, replace these examples with names you expect from your image.
			// For example, if your image contains "John Doe" and "Jane Smith":
			/*
			const fullNames = students.map(s => `${s.name} ${s.lastName || ''}`.trim());
			expect(fullNames).toContain('John Doe');
			expect(fullNames).toContain('Jane Smith');
			*/

			// Example for checking just first names:
			/*
			const firstNames = students.map(s => s.name);
			expect(firstNames).toContain('John');
			expect(firstNames).toContain('Jane');
			*/
		},
		{ timeout: 30000 } // Increase timeout for network requests
	);
});
