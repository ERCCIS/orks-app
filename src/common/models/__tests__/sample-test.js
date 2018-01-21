import DateHelp from 'helpers/date';
import Sample from 'sample';
import Occurrence from 'occurrence';
import userModel from 'user_model';
import appModel from 'app_model';
import Survey from 'common/config/surveys/Survey';
import { coreAttributes } from 'common/config/surveys/general';
import bryophytesSyrvey from 'common/config/surveys/general/bryophytes';
import dragonfliesSyrvey from 'common/config/surveys/general/dragonflies';
import { savedSamples, Collection } from '../../saved_samples';
import store from '../../store';

/* eslint-disable no-unused-expressions */
const validTaxon = { warehouse_id: 1, group: 1 };

function getRandomSample(taxon) {
  const occurrence = new Occurrence({
    taxon: taxon || validTaxon,
  });
  const sample = new Sample(
    {
      location: {
        latitude: 12.12,
        longitude: -0.23,
        name: 'automatic test',
      },
    },
    {
      occurrences: [occurrence],
      Collection: savedSamples,
      onSend: () => {}, // overwrite Collection's one checking for user login
    }
  );

  sample.metadata.saved = true;

  return sample;
}

describe('Sample', () => {
  it('should have current date by default', () => {
    const sample = new Sample();
    const date = sample.get('date');

    expect(DateHelp.print(date)).to.be.equal(DateHelp.print(new Date()));
  });

  it('should set training mode', () => {
    appModel.set('useTraining', false);

    let sample = getRandomSample();
    expect(sample.metadata.training).to.be.equal(false);

    appModel.set('useTraining', true);

    sample = getRandomSample();
    expect(sample.metadata.training).to.be.equal(true);
  });

  describe('getKeys', () => {
    it.skip('should call getSurvey and return its sample attrs', () => {
      expect(false).to.be.equal(true);
    });
  });

  describe('validation', () => {
    it('should return sample send false invalid if not saved', () => {
      const sample = getRandomSample();
      delete sample.metadata.saved;
      sample.setTaxon(validTaxon);
      expect(sample.validate).to.be.a('function');
      sample.clear();

      const invalids = sample.validate(null, { remote: true });
      expect(invalids.attributes.send).to.be.false;
    });

    it('should return attributes and occurrence objects with invalids', () => {
      const sample = getRandomSample();
      sample.metadata.saved = true;
      sample.clear();

      let invalids = sample.validate({}, { remote: true });
      expect(invalids)
        .to.be.an('object')
        .and.have.all.keys('attributes', 'occurrences', 'samples');

      // sample
      expect(invalids.attributes).to.have.all.keys(
        'date',
        'location',
        'location name'
      );

      // occurrence
      expect(invalids.occurrences).to.be.an('object').and.to.be.empty;

      const occurrence = new Occurrence();
      sample.addOccurrence(occurrence);
      invalids = sample.validate(null, { remote: true });
      expect(invalids.occurrences).to.not.be.empty;
      expect(invalids.occurrences).to.have.property(occurrence.cid);
    });
  });

  describe('setToSend', () => {
    it('should set the saved flag in sample metadata', () => {
      const sample = getRandomSample();
      sample.setToSend();
      expect(sample.metadata.saved).to.be.true;
    });

    it('should return a promise', () => {
      const sample = getRandomSample();
      const promise = sample.setToSend();
      expect(promise).to.be.an.instanceof(Promise);
    });

    it('should not send if invalid, but set validationError', () => {
      const sample = getRandomSample();
      delete sample.attributes.location;
      delete sample.metadata.saved;
      const valid = sample.setToSend();
      expect(valid).to.be.false;

      expect(sample.validationError).to.be.an('object');
      expect(sample.metadata.saved).to.be.false;
    });
  });

  describe('setTaxon', () => {
    it('should exist', () => {
      const sample = getRandomSample();
      expect(sample.setTaxon).to.be.a('function');
    });

    it('should return a promise', () => {
      const sample = getRandomSample();
      expect(sample.setTaxon(validTaxon)).to.be.instanceOf(Promise);
    });

    it('should set taxon to the first occurrence', done => {
      const sample = getRandomSample();
      sample
        .setTaxon(validTaxon)
        .then(() => {
          expect(sample.getOccurrence().get('taxon').warehouse_id).to.be.equal(
            1
          );
          done();
        })
        .catch(done);
    });

    it('should throw if no occurrence exists', done => {
      const sample = new Sample();
      sample.setTaxon(validTaxon).catch(err => {
        expect(err.message).to.equal('No occurrence present to set taxon');
        done();
      });
    });

    it('should throw if no taxon group exists', done => {
      const sample = new Sample();
      sample.setTaxon({ warehouse_id: 1 }).catch(err => {
        expect(err.message).to.equal('New taxon must have a group');
        done();
      });
    });

    it('should return rejected Promise if sample survey is complex', done => {
      const sample = getRandomSample();
      sample.metadata.complex_survey = true;
      sample.setTaxon(validTaxon).catch(err => {
        expect(err.message).to.equal(
          'Only general survey samples can use setTaxon method'
        );
        done();
      });
    });

    it('should remove all non core attributes on survey change', done => {
      const dragonfly = { group: dragonfliesSyrvey.taxonGroups[0] };
      const sample = getRandomSample(dragonfly);

      // custom attributes
      sample.set('non_core_attr', 1);
      sample.getOccurrence().set('non_core_attr', 1);

      const bryophyte = { group: bryophytesSyrvey.taxonGroups[0] };
      sample
        .setTaxon(bryophyte)
        .then(() => {
          expect(sample.get('non_core_attr')).to.be.an.undefined;
          expect(sample.getOccurrence().get('non_core_attr')).to.be.an
            .undefined;
          done();
        })
        .catch(done);
    });

    it('should retain all core attributes on survey change', done => {
      const dragonfly = { group: dragonfliesSyrvey.taxonGroups[0] };
      const sample = getRandomSample(dragonfly);

      // set all core attributes
      const sampleKeys = coreAttributes
        .filter(key => key.includes('smp:'))
        .map(key => key.replace('smp:', ''));
      const sampleKeyValues = {};
      sampleKeys.forEach(key => {
        sampleKeyValues[key] = Math.random();
        sample.set(key, sampleKeyValues[key]);
      });
      const occKeys = coreAttributes
        .filter(key => key.includes('occ:'))
        .map(key => key.replace('occ:', ''));
      const occKeyValues = {};
      occKeys.forEach(key => {
        occKeyValues[key] = Math.random();
        sample.getOccurrence().set(key, occKeyValues[key]);
      });

      const bryophyte = { group: bryophytesSyrvey.taxonGroups[0] };
      sample
        .setTaxon(bryophyte)
        .then(() => {
          sampleKeys.forEach(key => {
            expect(sample.get(key)).to.eql(sampleKeyValues[key]);
          });
          occKeys.forEach(key => {
            expect(sample.getOccurrence().get(key)).to.eql(occKeyValues[key]);
          });
          done();
        })
        .catch(done);
    });
  });

  describe('getSurvey', () => {
    let surveyFacotryStub;

    before(() => {
      surveyFacotryStub = sinon.stub(Survey, 'factory');
    });

    after(() => {
      surveyFacotryStub.restore();
    });

    it('should exist', () => {
      const sample = getRandomSample();
      expect(sample.getSurvey).to.be.a('function');
    });

    it('should return survey factory result', () => {
      surveyFacotryStub.returns(1);

      const sample = getRandomSample();
      sample.setTaxon(validTaxon);
      const survey = sample.getSurvey();
      expect(surveyFacotryStub.called).to.be.equal(true);
      expect(survey).to.equal(1);
    });

    it('should throw if no occurrence exists', done => {
      const sample = new Sample();
      try {
        sample.getSurvey();
      } catch (err) {
        expect(err.message).to.equal('No occurrence present to get survey');
        done();
      }
    });

    it('should throw if no occurrence taxon group exists', () => {
      const sample = getRandomSample();
      try {
        sample.getSurvey();
      } catch (err) {
        expect(err.message).to.equal(
          'No occurrence taxon group is present to get survey'
        );
      }
    });

    it('should return complex survey', () => {
      surveyFacotryStub.withArgs(null, true).returns('complex');
      const sample = getRandomSample();
      sample.metadata.complex_survey = true;
      expect(sample.getSurvey()).to.be.equal('complex');
    });
  });

  describe('Activities support', () => {
    function getRandActivity() {
      const activity = {
        id: (Math.random() * 100).toFixed(0),
        name: '',
        description: '',
        type: '',
        group_from_date: '2015-01-01',
        group_to_date: '2020-01-01',
      };
      return activity;
    }
    it('has functions', () => {
      const sample = new Sample();
      expect(sample.checkExpiredGroup).to.be.a('function');
    });

    it('should remove expired activities on init', done => {
      const sample = getRandomSample();
      const activity = getRandActivity();
      userModel.set('activities', [activity]);
      userModel.save();
      sample.set('group', activity);
      sample.save().then(() => {
        expect(sample.get('group')).to.be.an('object');

        // expire activities
        userModel.set('activities', []);
        userModel.save();

        // get the same sample - fresh
        const newCollection = new Collection([], { store, model: Sample });
        newCollection.fetch().then(() => {
          const newSample = newCollection.get(sample);
          expect(newSample.get('group')).to.be.undefined;
          done();
        });
      });
    });

    it('should remove expired activities on activities sync', () => {
      const sample = getRandomSample();
      const activity = getRandActivity();

      // OK
      userModel.set('activities', [activity]);
      sample.set('group', activity);
      userModel.trigger('sync:activities:end');
      expect(sample.get('group')).to.be.an('object');

      // expire
      userModel.set('activities', []);
      userModel.trigger('sync:activities:end');
      expect(sample.get('group')).to.be.undefined;
    });
  });

  describe('GPS extension', () => {
    it('has GPS functions', () => {
      const sample = new Sample();
      expect(sample.startGPS).to.be.a('function');
      expect(sample.stopGPS).to.be.a('function');
      expect(sample.isGPSRunning).to.be.a('function');
    });
  });
});
