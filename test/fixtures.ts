import { test as base, expect, type Page } from '@playwright/test';

// navigate through the ORKS onboarding slides and dismiss on the last one
const completeOnboarding = async (page: Page) => {
  const nextButton = page.locator('#welcome-page ion-footer ion-button');

  const SLIDE_COUNT = 5;

  for (let i = 0; i < SLIDE_COUNT; i++) {
    await expect(nextButton).toBeVisible();
    await nextButton.click();
  }
};

type Fixtures = {
  /** A page that has already completed onboarding and landed on the home screen. */
  homePage: Page;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    // keep browser tests independent of Mapbox credentials and network access
    await page.route('https://api.mapbox.com/**', async route => {
      const isStyle = route.request().url().includes('/styles/');
      await route.fulfill({
        json: isStyle
          ? { version: 8, sources: {}, layers: [] }
          : { type: 'FeatureCollection', features: [] },
      });
    });
    await page.goto('/');

    // onboarding is shown by default on a fresh session
    await page.waitForSelector('#welcome-page');

    await completeOnboarding(page);

    // wait for the main tab bar to confirm we reached the home screen
    await page.waitForSelector('ion-tab-bar');

    await use(page);
  },
});

export { expect } from '@playwright/test';
