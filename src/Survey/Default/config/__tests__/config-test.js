import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { onChange } from '@flumens/tailwind/dist/components/Block';
import appModel from 'models/app';
import defaultSurvey, { taxonGroupSurveys } from 'Survey/Default/config';
import birdsSurvey from '../birds';
import butterfliesSurvey, { butterflyNumberRangesAttr } from '../butterflies';
import {
  defaultSensitivityPrecisionAttr,
  numberAttr,
  numberRangesAttr,
  numberPageAttr,
} from '../common';
import dragonfliesSurvey from '../dragonflies';
import { numberAttr as orksNumberAttr, stageAttr, typeAttr } from '../orks';

i18n.use(initReactI18next).init({ lng: 'en' });

describe('default survey', () => {
  it('retains the ORKS abundance field and limit', () => {
    const [abundance] = defaultSurvey.occ.render;

    expect(defaultSurvey.id).toBe(490);
    expect(abundance.id).toBe(orksNumberAttr.id);
    expect(abundance.validation.max).toBe(500);
  });

  it('keeps upstream counting form definitions available', () => {
    ['arthropods', 'birds', 'mammals', 'moths', 'reptiles'].forEach(taxa =>
      expect(taxonGroupSurveys[taxa].occ.render[0]).toBe(numberPageAttr)
    );
  });

  it('requires an ORKS Type and retains warehouse choice IDs', () => {
    expect(defaultSurvey.occ.verify({ taxon: {} })).toBeDefined();
    expect(
      defaultSurvey.occ.verify({ taxon: {}, [typeAttr.id]: '' })
    ).toBeDefined();
    expect(
      defaultSurvey.occ.verify({ taxon: {}, [typeAttr.id]: '21966' })
    ).toBeUndefined();
    expect(typeAttr.choices).toContainEqual({
      title: 'Heard',
      dataName: '3384',
    });
    expect(stageAttr.choices).toContainEqual({
      title: 'Adult female',
      dataName: '3407',
    });
    expect(defaultSurvey.occ.render.map(block => block.id)).toEqual([
      'occAttr:93',
      'occAttr:218',
      'occAttr:217',
      'occAttr:18',
    ]);
  });

  it('keeps one abundance value', () => {
    const record = { [numberRangesAttr.id]: '665' };

    numberAttr.onChange(3, 'change', { record });
    expect(record).toEqual({ [numberAttr.id]: 3 });

    numberRangesAttr.onChange('666', 'change', {
      record,
      history: { goBack: jest.fn() },
    });
    expect(record).toEqual({
      [numberRangesAttr.id]: '666',
    });
  });

  it('uses the current plant attributes', () => {
    const { occ } = taxonGroupSurveys['plants-fungi'];
    const renderIds = occ.render.map(({ id }) => id);

    expect(renderIds).toEqual(
      expect.arrayContaining(['occAttr:507', 'occAttr:577', 'occAttr:610'])
    );
    ['occAttr:2', 'occAttr:16', 'occAttr:105', 'occAttr:523'].forEach(id => {
      expect(occ.attrs[id]).toBeUndefined();
      expect(renderIds).not.toContain(id);
    });

    expect(occ.verify({ taxon: {} })).toBeUndefined();
    expect(occ.verify({ taxon: {}, 'occAttr:610': 'LA' })).toBeUndefined();
    expect(occ.verify({ taxon: {}, 'occAttr:610': 'invalid' })).toBeDefined();
  });

  it('uses altitude and microhabitat for bryophytes', () => {
    const { occ } = taxonGroupSurveys.bryophytes;

    expect(occ.attrs['occAttr:577']).toBeDefined();
    expect(occ.attrs['occAttr:816']).toBeDefined();
    expect(occ.render.slice(0, 2).map(({ id }) => id)).toEqual([
      'occAttr:816',
      'occAttr:577',
    ]);
  });

  it('stores the selected sensitivity precision', () => {
    const record = {};
    const props = {
      record,
      blockIds: [],
      blockConfig: defaultSensitivityPrecisionAttr,
    };

    onChange('1000', 'change', props);
    expect(record.sensitivityPrecision).toBe('1000');

    onChange('', 'change', props);
    expect(record.sensitivityPrecision).toBe('');
  });

  it('uses the butterfly range attribute for locking', () => {
    const [abundance] = butterfliesSurvey.occ.render;
    const lockArgs = {
      record: { [butterflyNumberRangesAttr.id]: '2402' },
      survey: 'default',
      taxa: 'butterflies',
    };
    const isLocked = jest
      .spyOn(appModel.locks, 'isLocked')
      .mockReturnValue(true);
    const unset = jest.spyOn(appModel.locks, 'unset').mockImplementation();

    expect(abundance.lock.isLocked(lockArgs)).toBe(true);
    abundance.lock.unset(lockArgs);

    expect(isLocked).toHaveBeenCalledWith(
      'default',
      'butterflies',
      'occ',
      butterflyNumberRangesAttr.id,
      '2402'
    );
    expect(unset).toHaveBeenCalledWith(
      'default',
      'butterflies',
      'occ',
      butterflyNumberRangesAttr.id
    );

    isLocked.mockRestore();
    unset.mockRestore();
  });
});

describe('get', () => {
  const getSurvey = taxaGroup =>
    defaultSurvey.get({
      occurrences: taxaGroup ? [{ data: { taxon: { group: taxaGroup } } }] : [],
    });

  it('returns the default config without a matching species group', () => {
    expect(getSurvey().taxa).toBe('default');
    expect(getSurvey(111111111).taxa).toBe('default');
  });

  it('retains ORKS fields for birds', () => {
    const survey = getSurvey(birdsSurvey.taxaGroups[0]);

    expect(survey.taxa).toBe('default');
    expect(survey.attrs['smpAttr:127']).toBeDefined();
    expect(survey.occ.attrs['occAttr:823']).toBeUndefined();
    expect(survey.occ.attrs[typeAttr.id]).toBeDefined();
  });

  it('does not enable taxon-specific fields for dragonflies', () => {
    const survey = getSurvey(dragonfliesSurvey.taxaGroups[0]);

    expect(survey.taxa).toBe('default');
    expect(survey.occ.render).toBe(defaultSurvey.occ.render);
  });
});
