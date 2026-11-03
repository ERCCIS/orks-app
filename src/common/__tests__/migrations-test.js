import {
  getSampleTaxa,
  migrateSampleTree,
  migratePlantGridRefSystems,
  migrateOldPlantFungiAbundanceAttrs,
  migrateORKSOccAttrs,
  migrateORKSLocks,
} from 'common/migrations';
import { AppModel } from 'models/app';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import defaultSurvey from 'Survey/Default/config';
import { numberAttr, stageAttr, typeAttr } from 'Survey/Default/config/orks';

it('gets taxa from the taxon group with a legacy metadata fallback', () => {
  const sample = {
    occurrences: [{ data: { taxon: { group: 1 } } }],
    metadata: { taxa: 'legacy' },
    getSurvey: () => ({ taxa: 'birds' }),
  };

  expect(getSampleTaxa(sample)).toBe('birds');

  sample.occurrences = [];
  expect(getSampleTaxa(sample)).toBe('legacy');
});

it('preserves legacy plant abundance attributes separately', () => {
  [
    ['number', 12, 'occAttr:16', 12],
    ['numberDAFOR', 'Frequent', 'occAttr:2', '3'],
    ['number-ranges', '6-20', 'occAttr:523', '667'],
  ].forEach(([oldKey, oldValue, newKey, newValue]) => {
    const occurrence = { data: { [oldKey]: oldValue }, metadata: {} };

    migrateOldPlantFungiAbundanceAttrs(occurrence);

    expect(occurrence.data).toEqual({ [newKey]: newValue });
    expect(occurrence.metadata._migrated).toEqual({ [oldKey]: oldValue });
  });
});

it('sets Plant grid reference systems across the sample tree', () => {
  const child = {
    data: {
      enteredSrefSystem: 'OSIE',
      location: { gridref: 'SU1234' },
    },
    samples: [],
  };
  const sample = {
    data: {
      enteredSrefSystem: 'OSGB',
      location: { gridref: 'H3382' },
    },
    samples: [child],
  };

  migratePlantGridRefSystems(sample);

  expect(sample.data.enteredSrefSystem).toBe('OSIE');
  expect(child.data.enteredSrefSystem).toBe('OSGB');
});

it('moves legacy sample fields across the sample tree', () => {
  const child = {
    data: {
      date: '2026-08-29T08:23:59.139Z',
      location: { name: 'Child', geocoded: { center: [1, 2] } },
    },
    metadata: {},
    samples: [],
  };
  const sample = {
    data: {
      date: '2026-08-30T08:23:59.139Z',
      location: { name: 'Parent', geocoded: { center: [3, 4] } },
    },
    metadata: {},
    samples: [child],
  };

  migrateSampleTree(sample);

  expect(sample.data).toEqual({
    date: '2026-08-30',
    location: {},
    locationName: 'Parent',
  });
  expect(sample.metadata.geocoded).toEqual({ center: [3, 4] });
  expect(sample.metadata._migrated).toEqual({
    date: '2026-08-30T08:23:59.139Z',
    'location.name': 'Parent',
    'location.geocoded': { center: [3, 4] },
  });
  expect(child.data).toEqual({
    date: '2026-08-29',
    location: {},
    locationName: 'Child',
  });
  expect(child.metadata.geocoded).toEqual({ center: [1, 2] });
  expect(child.metadata._migrated).toEqual({
    date: '2026-08-29T08:23:59.139Z',
    'location.name': 'Child',
    'location.geocoded': { center: [1, 2] },
  });
});

it.each([0, 12, 500])(
  'migrates ORKS occurrence fields with abundance %s',
  number => {
    const occurrence = new Occurrence({
      data: {
        number,
        stage: 'Adult female',
        type: 'Heard',
        sensitivityPrecision: 1000,
        identifiers: ['Recorder'],
      },
    });
    const sample = new Sample({
      data: { surveyId: 490 },
      occurrences: [occurrence],
    });

    migrateORKSOccAttrs(occurrence);

    expect(occurrence.data).toMatchObject({
      [numberAttr.id]: number,
      [stageAttr.id]: '3407',
      [typeAttr.id]: '3384',
      'occAttr:18': ['Recorder'],
      sensitivityPrecision: 1000,
    });
    expect(occurrence.metadata._migrated).toMatchObject({
      number,
      stage: 'Adult female',
      type: 'Heard',
    });
    expect(sample.getSurvey().id).toBe(defaultSurvey.id);
    expect(sample.toDTO().occurrences[0].values).toMatchObject({
      [numberAttr.id]: number,
      [stageAttr.id]: '3407',
      [typeAttr.id]: '3384',
    });

    const migrated = occurrence.toJSON();
    migrateORKSOccAttrs(occurrence);
    expect(occurrence.toJSON()).toEqual(migrated);
  }
);

it('preserves every ORKS stage and Type warehouse mapping', () => {
  [stageAttr, typeAttr].forEach(attr => {
    attr.choices
      .filter(choice => choice.dataName)
      .forEach(choice => {
        const occurrence = new Occurrence({
          data: {
            [attr === stageAttr ? 'stage' : 'type']: choice.title,
          },
        });

        migrateORKSOccAttrs(occurrence);

        expect(occurrence.data[attr.id]).toBe(choice.dataName);
      });
  });
});

it('migrates core and custom locks without overwriting newer locks', async () => {
  const legacyLocks = {
    default: {
      default: {
        'smp:location': { name: 'Cornwall', latitude: 50, longitude: -5 },
        'smp:recorder': 'Recorder',
        'smp:groupId': '123',
        'occ:number': 12,
        'occ:stage': 'Adult female',
        'occ:type': 'Heard',
        'occ:sensitivityPrecision': 1000,
      },
    },
    complex: {
      'default-default': { 'smp:recorder': 'List Recorder' },
      'default-list': { 'occ:type': 'Living organism' },
    },
  };
  const app = new AppModel({
    data: { attrLocks: legacyLocks },
  });
  jest.spyOn(app, 'save').mockResolvedValue();

  migrateORKSLocks(app);

  expect(app.locks.getAll('default', 'all').smp).toEqual({
    location: { latitude: 50, longitude: -5 },
    locationName: 'Cornwall',
    'smpAttr:127': 'Recorder',
    groupId: '123',
  });
  expect(app.locks.getAll('default', 'default').occ).toEqual({
    sensitivityPrecision: 1000,
    [numberAttr.id]: 12,
    [stageAttr.id]: '3407',
    [typeAttr.id]: '3384',
  });
  expect(app.locks.get('list', 'default', 'occ', typeAttr.id)).toBe('21966');
  expect(app.locks.get('list', 'all', 'smp', 'smpAttr:127')).toBe(
    'List Recorder'
  );
  expect(app.data.attrLocks).toEqual(legacyLocks);

  await app.locks.set('default', 'default', 'occ', typeAttr.id, '3385');
  migrateORKSLocks(app);
  expect(app.locks.get('default', 'default', 'occ', typeAttr.id)).toBe('3385');
  await app.locks.unset('default', 'default', 'occ', typeAttr.id);
  expect(
    app.locks.get('default', 'default', 'occ', typeAttr.id)
  ).toBeUndefined();
});
