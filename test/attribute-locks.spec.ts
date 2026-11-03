import { test } from './fixtures';
import {
  checkTaxaLockPreservation,
  expectBirdLocks,
  lockBirdAttributes,
  openDefaultSurvey,
  openOtherSurvey,
  selectSpecies,
} from './utils';

test.describe('Attribute locks', () => {
  test('Default survey preserves ORKS locks across taxon groups', async ({
    homePage,
  }) => {
    await openDefaultSurvey(homePage);
    await selectSpecies(homePage, 'Blackbird', /^BlackbirdTurdus merulabird$/);
    const record = homePage.locator('#survey-default-edit').last();
    await lockBirdAttributes(homePage, record);

    // a new bird inherits the custom fields and comment locks
    await homePage.getByRole('button', { name: 'Back' }).first().click();
    await openDefaultSurvey(homePage);
    await selectSpecies(homePage, 'Robin', /^RobinErithacus rubeculabird$/);
    await expectBirdLocks(record);
    await homePage.getByRole('button', { name: 'OK, got it' }).click();

    await checkTaxaLockPreservation(homePage, record);
  });

  test('Species List Survey switches taxa-specific locks', async ({
    homePage,
  }) => {
    test.skip(true, 'Other survey creation is disabled in ORKS.');
    // Create a list and add a bird.
    await openOtherSurvey(homePage, 'Species List Survey');
    await homePage.getByRole('button', { name: 'Add Species' }).click();
    await selectSpecies(homePage, 'Blackbird', /^BlackbirdTurdus merulabird$/);
    await homePage.getByRole('button', { name: 'Back' }).click();
    await homePage.getByRole('link', { name: /Blackbird/ }).click();

    const occurrence = homePage.locator('#survey-default-edit').last();
    await lockBirdAttributes(homePage, occurrence);

    // Another bird in the list inherits both locks.
    await occurrence.getByRole('button', { name: 'Back' }).click();
    await homePage.getByRole('button', { name: 'Add Species' }).click();
    await selectSpecies(homePage, 'Robin', /^RobinErithacus rubeculabird$/);
    await homePage.getByRole('button', { name: 'Back' }).click();
    await homePage.getByRole('link', { name: /Robin/ }).click();
    await expectBirdLocks(occurrence);

    // Taxa-specific values and locks are replaced when the group changes.
    await checkTaxaLockPreservation(homePage, occurrence);
  });
});
