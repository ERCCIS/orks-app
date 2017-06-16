/** ****************************************************************************
 * Sample List main view.
 *****************************************************************************/
import $ from 'jquery';
import Marionette from 'backbone.marionette';
import 'marionette.sliding-view';
import Indicia from 'indicia';
import Hammer from 'hammerjs';
import Log from 'helpers/log';
import StringHelp from 'helpers/string';
import Device from 'helpers/device';
import DateHelp from 'helpers/date';
import JST from 'JST';
import Gallery from '../../common/gallery';
import LoaderView from '../../common/views/loader_view';
import './styles.scss';

window.Marionette = Marionette;

const SampleView = Marionette.View.extend({
  tagName: 'li',
  className: 'table-view-cell swipe',

  triggers: {
    'click #delete': 'sample:delete',
  },

  events: {
    // need to pass the attribute therefore 'triggers' method does not suit
    'click .js-attr': (e) => {
      e.preventDefault();
      this.trigger('sample:edit:attr', $(e.target).data('attr'));
    },
    'click img': 'photoView',
  },

  modelEvents: {
    'request sync error': 'render',
    geolocation: 'render',
  },

  initialize() {
    this.template = JST['samples/list/sample'];
  },

  photoView(e) {
    e.preventDefault();

    const items = [];

    this.model.getOccurrence().media.each((image) => {
      items.push({
        src: image.getURL(),
        w: image.get('width') || 800,
        h: image.get('height') || 800,
      });
    });

    // Initializes and opens PhotoSwipe
    const gallery = new Gallery(items);
    gallery.init();
  },

  onRender() {
    // add mobile swipe events
    // early return
    if (!Device.isMobile()) return;

    this.$sample = this.$el.find('a');
    this.docked = false;
    this.position = 0;

    const options = {
      threshold: 50,
      toolsWidth: 100,
    };

    const hammertime = new Hammer(this.el, { direction: Hammer.DIRECTION_HORIZONTAL });
    const that = this;

    // on tap bring back
    this.$sample.on('tap click', $.proxy(this._swipeHome, this));

    hammertime.on('pan', (e) => {
      e.preventDefault();
      that._swipe(e, options);
    });
    hammertime.on('panend', (e) => {
      that._swipeEnd(e, options);
    });
  },

  remove() {
    Log('Samples:MainView: removing a sample.');
    // removing the last element leaves emptyView + fading out entry for a moment
    if (this.model.collection && this.model.collection.length >= 1) {
      const that = this;
      this.$el.addClass('shrink');
      setTimeout(() => {
        Marionette.View.prototype.remove.call(that);
      }, 300);
    } else {
      Marionette.View.prototype.remove.call(this);
    }
  },

  serializeData() {
    const sample = this.model;
    const occ = sample.getOccurrence();
    const date = DateHelp.print(sample.get('date'));
    const specie = occ.get('taxon') || {};
    const media = occ.media;
    let img = media.length && media.at(0).get('thumbnail');

    if (!img) {
      // backwards compatibility
      img = media.length && media.at(0).getURL();
    }

    const taxon = specie[specie.found_in_name];

    const syncStatus = this.model.getSyncStatus();

    const locationPrint = sample.printLocation();
    const location = sample.get('location') || {};

    let number = occ.get('number') && StringHelp.limit(occ.get('number'));
    if (!number) {
      number = occ.get('number-ranges') && StringHelp.limit(occ.get('number-ranges'));
    }

    const group = sample.get('group');

    return {
      id: sample.cid,
      saved: sample.metadata.saved,
      training: occ.metadata.training,
      onDatabase: syncStatus === Indicia.SYNCED,
      isLocating: sample.isGPSRunning(),
      location: locationPrint,
      location_name: location.name,
      isSynchronising: syncStatus === Indicia.SYNCHRONISING,
      date,
      taxon,
      number,
      stage: occ.get('stage') && StringHelp.limit(occ.get('stage')),
      comment: occ.get('comment'),
      group,
      img: img ? `<img src="${img}"/>` : '',
    };
  },

  _swipe(e, options) {
    // only swipe if no scroll up
    if (Math.abs(e.deltaY) > 10) return;

    if (this.docked) {
      this.position = -options.toolsWidth + e.deltaX;
    } else {
      this.position = e.deltaX;
    }

    // protection of swipeing right too much
    if (this.position > 0) this.position = 0;

    this.$sample.css('transform', `translateX(${this.position}px)`);
  },

  _swipeEnd(e, options) {
    // only swipe if no scroll up and is not in the middle
    if (Math.abs(e.deltaY) > 10 && !this.position) return;

    if ((-options.toolsWidth + e.deltaX) > -options.toolsWidth) {
      // bring back
      this.position = 0;
      this.docked = false;
    } else {
      // open tools
      this.docked = true;
      this.position = -options.toolsWidth;
    }

    this.$sample.css('transform', `translateX(${this.position}px)`);
  },

  _swipeHome(e) {
    if (this.docked) {
      e.preventDefault();
      this.position = 0;
      this.$sample.css('transform', `translateX(${this.position}px)`);
      this.docked = false;
    }
  },
});

var cellHeight = 65;

const $main = $('#main');
var viewportHeight = $main.height();
var viewport = $main[0];
const viewContainsNo = Math.floor(viewportHeight / cellHeight);

const excessNo = viewContainsNo;
const initialLowerBound = 0;
const initialUpperBound = viewContainsNo + excessNo;

const Slider = Marionette.SlidingView.extend({
  id: 'samples-list',
  className: 'table-view no-top',

  childView: SampleView,
  emptyView: LoaderView,

  // initialLowerBound: 0,
  // indexOffset: offset,

  registerUpdateEvent() {
    var self = this;
    // Execute the throttled callback on scroll
    $main.on('scroll', () => {
      self.onUpdateEvent();
    });
  },

  onUpdateEvent: function() {
    var self = this;
    requestAnimationFrame(function() {
      self.throttledUpdateHandler();
    });
  },

  initialLowerBound,
  initialUpperBound,

  getLowerBound: function() {
    return 0;
  },

  getUpperBound: function(lowerBound) {
    const scrolledNo = Math.floor(viewport.scrollTop / cellHeight);

    return lowerBound + viewContainsNo + excessNo + scrolledNo;
  },

  pruneCollection: function(lowerBound, upperBound) {
    console.log(`Prune ${lowerBound} ${upperBound}`)
    return this.referenceCollection.slice(lowerBound, upperBound)
  },

  childViewOptions() {
    return {
      appModel: this.options.appModel,
    };
  },

  serializeData() {
    const activity = this.options.appModel.getAttrLock('activity') || {};
    return {
      useTraining: this.options.appModel.get('useTraining'),
      activity: activity.title,
    };
  },
});

export default Marionette.View.extend({
  id: 'samples-list-container',
  template: JST['samples/list/main'],

  regions: {
    body: {
      el: '#samples-list',
      replaceElement: true
    }
  },

  onRender: function() {
    this.showChildView('body', new Slider({
      referenceCollection: this.collection,
      appModel: this.options.appModel
    }));
  }
});

