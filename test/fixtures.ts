import { test as base, expect, type Page } from '@playwright/test';

// navigate through all 4 onboarding slides and dismiss on the last one
const completeOnboarding = async (page: Page) => {
  const nextButton = page.locator('#welcome-page ion-footer ion-button');

  // 3 slides with the forward arrow, 1 final slide with the checkmark
  const SLIDE_COUNT = 4;

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
