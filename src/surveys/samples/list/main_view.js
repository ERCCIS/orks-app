/** ****************************************************************************
 * Surveys List main view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import JST from 'JST';
import { default as _MainView, SampleView as _SampleView } from '../../../samples/list/main_view';

const SampleView = Marionette.View.extend({
  tagName: 'li',
  className: 'table-view-cell swipe',

  template: JST['surveys/samples/list/sample'],

  triggers: _SampleView.prototype.triggers,

  events: _SampleView.prototype.events,

  modelEvents: _SampleView.prototype.modelEvents,

  photoView: _SampleView.prototype.photoView,
  onRender: _SampleView.prototype.onRender,
  remove: _SampleView.prototype.remove,

  serializeData() {
    const sample = this.model;
    const occ = sample.getOccurrence();
    const specie = occ.get('taxon') || {};
    const media = occ.media;
    let img = media.length && media.at(0).get('thumbnail');

    if (!img) {
      // backwards compatibility
      img = media.length && media.at(0).getURL();
    }

    const taxon = specie[specie.found_in_name];

    const locationPrint = sample.printLocation();
    const location = sample.get('location') || {};

    return {
      id: sample.cid,
      isLocating: sample.isGPSRunning(),
      location: locationPrint,
      location_name: location.name,
      taxon,
      comment: occ.get('comment'),
      img: img ? `<img src="${img}"/>` : '',
    };
  },

  _swipe: _SampleView.prototype._swipe,
  _swipeEnd: _SampleView.prototype._swipeEnd,
  _swipeHome: _SampleView.prototype._swipeHome,
});

const NoSamplesView = Marionette.View.extend({
  tagName: 'li',
  className: 'table-view-cell empty',
  template: JST['surveys/samples/list/list-none'],
});

const MainView = _MainView.extend({
  template: JST['surveys/samples/list/main'],

  childView: SampleView,
  NoSamplesView,
  serializeData() {},
});

export { MainView as default, SampleView };
