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
            include: [
                'src/components/arrendamiento/contractUtils.ts',
                'src/components/arrendamiento/validation.ts',
                'src/components/arrendamiento/ContractTemplate.tsx',
                'src/components/pagare/pagareUtils.ts',
                'src/components/pagare/validation.ts',
                'src/components/pagare/PagareTemplate.tsx',
                'src/components/shared/ColombiaLocationSelect.tsx',
            ],
        },
    },
});
