import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    outputDir: './e2e/test-results',
    timeout: 120_000, // 2 min — html2canvas + jsPDF can be slow
    fullyParallel: false,
    retries: 0,
    reporter: [['list'], ['html', { outputFolder: 'e2e/report', open: 'never' }]],

    use: {
        baseURL: 'http://localhost:4321',
        trace: 'retain-on-failure',
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
        // Give enough time for html2canvas + jsPDF to finish
        actionTimeout: 30_000,
        navigationTimeout: 15_000,
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:4321',
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
    },
});
