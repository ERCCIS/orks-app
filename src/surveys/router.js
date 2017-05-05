/** ****************************************************************************
 * Settings router.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import App from 'app';
import radio from 'radio';
import Log from 'helpers/log';
import ListController from './list/controller';
import ShowController from './show/controller';
import EditAttrController from './attr/controller';
import EditController from './edit/controller';
import SamplesListController from './samples/list/controller';
import SamplesEditController from './samples/edit/controller';
import SamplesEditAttrController from './samples/attr/controller';
import SamplesEditTaxonController from '../common/pages/taxon/controller';
import LocationController from '../common/pages/location/controller';

App.settings = {};

const Router = Marionette.AppRouter.extend({
  routes: {
    'surveys(/)': ListController.show,
    'surveys/:id': ShowController.show,
    'surveys/:id/edit(/)': EditController.show,

    'surveys/:id/edit/samples(/)': SamplesListController.show,
    'surveys/:id/edit/samples/new(/)': SamplesEditTaxonController.show,
    'surveys/:id/edit/samples/:id/edit(/)': SamplesEditController.show,
    'surveys/:id/edit/samples/:id/edit/taxon(/)': SamplesEditTaxonController.show,
    'surveys/:id/edit/samples/:id/edit/location(/)': LocationController.show,
    'surveys/:id/edit/samples/:id/edit/:attr(/)': SamplesEditAttrController.show,

    'surveys/:id/edit/location(/)': LocationController.show,
    'surveys/:id/edit/:attr(/)': EditAttrController.show,
    'surveys/*path': () => { radio.trigger('app:404:show'); },
  },
});

radio.on('surveys:list', (options) => {
  App.navigate('surveys', options);
  ListController.show();
});

radio.on('surveys:edit', (sampleID, options) => {
  App.navigate(`surveys/${sampleID}/edit`, options);
  EditController.show(sampleID);
});

radio.on('surveys:samples:edit', (surveySampleID, sampleID, options) => {
  App.navigate(`surveys/${surveySampleID}/edit/samples/${sampleID}/edit`, options);
  SamplesEditController.show(surveySampleID, sampleID);
});

radio.on('surveys:samples:edit:taxon', (surveySampleID, sampleID, options = {}) => {
  App.navigate(`surveys/${surveySampleID}/edit/samples/${sampleID}/edit/taxon`, options);
  SamplesEditTaxonController.show(options);
});

App.on('before:start', () => {
  Log('Settings:router: initializing.');
  App.settings.router = new Router();
});
