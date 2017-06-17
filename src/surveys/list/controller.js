/** ****************************************************************************
 * Surveys List controller.
 *****************************************************************************/
import Indicia from 'indicia';
import Backbone from 'backbone';
import radio from 'radio';
import Log from 'helpers/log';
import Analytics from 'helpers/analytics';
import Sample from 'sample';
import appModel from 'app_model';
import savedSamples from 'saved_samples';
import MainView from './main_view';
import LoaderView from '../../common/views/loader_view';
import HeaderView from './header_view';

const API = {
  show(options = {}) {
    Log('Surveys:List:Controller: showing.');
    // wait till savedSamples is fully initialized
    if (savedSamples.fetching) {
      const that = this;
      savedSamples.once('fetching:done', () => {
        API.show.apply(that);
      });
      radio.trigger('app:main', new LoaderView());
    } else {
      API.showMainView(options);
    }

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Surveys',
      }),
    });
    headerView.on('surveys', () => {
      radio.trigger('samples:list', { replace: true });
    });
    headerView.on('create', API.addSurvey);

    radio.trigger('app:header', headerView);

    // FOOTER
    radio.trigger('app:footer:hide');
  },

  showMainView(options) {
    const mainView = new MainView({
      collection: savedSamples.subcollection({
        filter: model => model.metadata.complex_survey,
      }),
      scroll: options.scroll,
      appModel,
    });

    mainView.on('atlas:toggled', (setting, on) => {
      Log('Samples:List:Controler: atlas toggled.');

      appModel.set(setting, on);
      appModel.save();
    });

    mainView.on('childview:create', API.addSurvey);
    mainView.on('childview:sample:delete', (childView) => {
      API.sampleDelete(childView.model);
    });

    radio.trigger('app:main', mainView);
  },

  sampleDelete(sample) {
    Log('Samples:List:Controller: deleting sample.');

    const syncStatus = sample.getSyncStatus();
    let body = 'This record hasn\'t been saved to iRecord yet, ' +
      'are you sure you want to remove it from your device?';

    if (syncStatus === Indicia.SYNCED) {
      body = 'Are you sure you want to remove this record from your device?';
      body += '</br><i><b>Note:</b> it will remain on the server.</i>';
    }
    radio.trigger('app:dialog', {
      title: 'Delete',
      body,
      buttons: [
        {
          title: 'Cancel',
          onClick() {
            radio.trigger('app:dialog:hide');
          },
        },
        {
          title: 'Delete',
          class: 'btn-negative',
          onClick() {
            sample.destroy();
            radio.trigger('app:dialog:hide');
            Analytics.trackEvent('List', 'sample remove');
          },
        },
      ],
    });
  },

  addSurvey() {
    API.addSurveySample()
      .then((sample) => {
        radio.trigger('surveys:edit', sample.cid);
      })
      .catch((err) => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  },

  /**
   * Creates a new survey.
   */
  addSurveySample() {
    return Sample.createNewSample('plant', null, null).then((sample) => {
      sample.set('recorder_count', 1);
      sample.set('recorder_names', 'me');

      return sample.save().then(() => {
        savedSamples.add(sample);
        sample.startGPS();
        return sample;
      });
    });

    // append locked attributes
    // appModel.appendAttrLocks(sample);
  },
};

export { API as default };
