import Marionette from 'backbone.marionette';
import _ from 'lodash';
import RangeInputView from 'common/views/rangeInputView';
import CONFIG from 'config';

export default Marionette.View.extend({
  template: _.template(`
    <div class="info-message">
      <p>
        ${CONFIG.indicia.surveys.general.occurrence.number.label}
      </p>
    </div>
    <div id="slider"></div>
  `),

  regions: {
    slider: {
      el: '#slider',
      replaceElement: true,
    },
  },

  onRender() {
    // slider view
    const sliderView = new RangeInputView({
      default: this.options.defaultNumber,
    });
    this.sliderView = sliderView;
    const sliderRegion = this.getRegion('slider');
    sliderRegion.show(sliderView);
  },

  getValues() {
    const value = this.sliderView.getValues();

    return value;
  },
});
