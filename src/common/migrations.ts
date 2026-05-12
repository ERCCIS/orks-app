/* eslint-disable no-restricted-syntax */
import { Migration, SampleCollection } from '@flumens';
import MigrationsManager from '@flumens/utils/dist/MigrationManager';
import { statusAttr, statusAttrOld } from 'Survey/Plant/config';
import { plantStageAttr, plantStageAttrOld } from 'Survey/common/config';
import config from './config';
import migrateOldAttr from './migrateOldAttr';
import Occurrence from './models/occurrence';
import Sample from './models/sample';
import { db, samplesStore } from './models/store';

// Run first migration
// TODO: remove in future when all users have updated
if (!window.localStorage.getItem('_lastAppMigratedVersion'))
  window.localStorage.setItem('_lastAppMigratedVersion', '1.0.0');

const migrations: Migration[] = [
  {
    version: '6.3.0',
    name: 'Move models to new schema',
    up: async () => {
      console.log('🔵 Starting migration to new model schema');

      try {
        await db.query({ sql: "UPDATE samples SET id = NULL WHERE id is ''" });
        await db.query({ sql: "UPDATE groups SET id = NULL WHERE id is ''" });
      } catch (error) {
        console.debug(
          '🔵 samples/groups table does not exist, skipping migration'
        );
      }

      // await db.sqliteConnection.closeAllConnections();
      console.log('🔵 Migration completed successfully');
    },
  },

  {
    version: '6.5.0',
    name: 'Move Plant survey sample attributes to new schema',
    up: async () => {
      console.log('🔵 Starting migration to new attribute schema');

      const samples = new SampleCollection({
        store: samplesStore,
        Model: Sample,
        Occurrence,
      });

      await samples.fetch();

      for (const sample of samples) {
        const isPlantSurvey = sample.data.surveyId === 325;
        if (isPlantSurvey) {
          console.log('🔵 Migrating sample', sample.cid);

          // migrateOldAttr(sample.data, 'field-of-vision', {}, locationOfWatchAttr);

          for (const subSample of sample.samples) {
            //   migrateOldAttr(subSample.data, 'swell', swellAttrOld, swellAttr);

            for (const occurrence of subSample.occurrences) {
              migrateOldAttr(
                occurrence.data,
                'stage',
                plantStageAttrOld,
                plantStageAttr
              );
              migrateOldAttr(
                occurrence.data,
                'status',
                statusAttrOld,
                statusAttr
              );
            }
          }

          // eslint-disable-next-line no-await-in-loop
          await sample.save();
        }
      }

      console.log('🔵 Migration completed successfully');
    },
  },
];

const newVersion = () => config.version;
const currentVersion = () =>
  window.localStorage.getItem('_lastAppMigratedVersion') || null;

const updateVersion = async (version: string) => {
  window.localStorage.setItem('_lastAppMigratedVersion', version);
};

const migrationManager = new MigrationsManager(
  migrations,
  newVersion,
  currentVersion,
  updateVersion
);

export default migrationManager;
