import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/components/**/*.{ts,tsx}', 'src/stores/**/*.ts', 'src/services/**/*.ts'],
            exclude: [
                'src/components/**/__tests__/**',
                'src/stores/**/__tests__/**',
                'src/components/**/*PDF.tsx',
                'src/components/**/steps/**',
                'src/components/**/*Form.tsx',
            ],
        },
    },
});
