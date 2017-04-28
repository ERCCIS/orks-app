/** ****************************************************************************
 * Sample Edit main view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import Indicia from 'indicia';
import JST from 'JST';
import DateHelp from 'helpers/date';
import StringHelp from 'helpers/string';

import './styles.scss';

export default Marionette.View.extend({
  template: JST['surveys/samples/edit/main'],

  initialize() {
    const sample = this.model.get('sample');
    this.listenTo(sample, 'request sync error geolocation', this.render);
  },

  serializeData() {
    const sample = this.model.get('sample');
    const occ = sample.getOccurrence();
    const specie = occ.get('taxon') || {};
    const appModel = this.model.get('appModel');

    // taxon
    const scientificName = specie.scientific_name;
    const commonName = specie.common_name;

    const locationPrint = sample.printLocation();
    const location = sample.get('location') || {};

    let numberLock = appModel.isAttrLocked('number', occ.get('number'), 'general');
    if (!numberLock) {
      numberLock = appModel.isAttrLocked('number-ranges', occ.get('number-ranges'));
    }

    const attrLocks = {
      date: appModel.isAttrLocked('date', sample.get('date'), 'general'),
      location: appModel.isAttrLocked('location', sample.get('location'), 'general'),
      number: numberLock,
      stage: appModel.isAttrLocked('stage', occ.get('stage'), 'general'),
      identifiers: appModel.isAttrLocked('identifiers', occ.get('identifiers'), 'general'),
      comment: appModel.isAttrLocked('comment', occ.get('comment'), 'general'),
      activity: appModel.isAttrLocked('activity', sample.get('group'), 'general'),
    };

    let number = occ.get('number') && StringHelp.limit(occ.get('number'));
    if (!number) {
      number = occ.get('number-ranges') && StringHelp.limit(occ.get('number-ranges'));
    }

    // show activity title.
    const group = sample.get('group');

    return {
      surveySampleID: sample.parent.cid,
      id: sample.cid,
      scientificName,
      commonName,
      training: occ.metadata.training,
      isLocating: sample.isGPSRunning(),
      isSynchronising: sample.getSyncStatus() === Indicia.SYNCHRONISING,
      location: locationPrint,
      location_name: location.name,
      date: DateHelp.print(sample.get('date'), true),
      number,
      stage: occ.get('stage') && StringHelp.limit(occ.get('stage')),
      identifiers: occ.get('identifiers') && StringHelp.limit(occ.get('identifiers')),
      comment: occ.get('comment') && StringHelp.limit(occ.get('comment')),
      group_title: group ? group.title : null,
      group,
      locks: attrLocks,
    };
  },
});
