import Marionette from "backbone.marionette";
import _ from "lodash";
import RangeInputView from "common/views/rangeInputView";

export default Marionette.View.extend({
  template() {
    return _.template(`
    <div class="info-message">
      <p>
        How many individuals of this type?
      </p>
    </div>
    <div id="slider"></div>
  `);
  },

  regions: {
    slider: {
      el: "#slider",
      replaceElement: true
    }
  },

  onRender() {
    // slider view
    const sliderView = new RangeInputView({
      default: this.options.defaultNumber
    });
    this.sliderView = sliderView;
    const sliderRegion = this.getRegion("slider");
    sliderRegion.show(sliderView);
  },

  getValues() {
    return this.sliderView.getValues();
  }
});
