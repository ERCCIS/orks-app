import { AppModel } from '../app_model';

function genLocation() {
  const location = {
    latitude: 12,
    longitude: 12,
    name: 'name',
  };

  return location;
}

function initAppModel() {
  const appModel = new AppModel();
  return appModel._init.then(() => appModel);
}

describe('Past locations extension', () => {
  it('has functions', () => {
    const appModel = new AppModel();
    expect(appModel.setLocation).to.be.a('function');
    expect(appModel.removeLocation).to.be.a('function');
    expect(appModel.printLocation).to.be.a('function');
  });

  describe('setLocation', () => {
    beforeEach(() => initAppModel().then(appModel => appModel.resetDefaults()));

    it('should set a new location', () => {
      const location = genLocation();
      return initAppModel().then(appModel => {
        appModel.setLocation(location);
        expect(appModel.get('locations').length).to.be.equal(1);
      });
    });

    it('should remove a location', () => {
      const location = genLocation();

      return initAppModel().then(appModel => {
        const savedLocation = appModel.setLocation(location);
        expect(savedLocation).to.be.an('object');
        expect(savedLocation.latitude).to.be.equal(location.latitude);
        expect(savedLocation.id).to.be.a('string');

        appModel.removeLocation(savedLocation.id);
        expect(appModel.get('locations').length).to.be.equal(0);
      });
    });

    it('should not duplicate same location', () => {
      const location = genLocation();

      return initAppModel().then(appModel => {
        const savedLocation = appModel.setLocation(location);
        const secondSavedLocation = appModel.setLocation(savedLocation);
        expect(secondSavedLocation).to.be.an('object');

        appModel.setLocation(location);

        expect(appModel.get('locations').length).to.be.equal(1);
      });
    });

    it('should update same location', () => {
      const location = genLocation();

      return initAppModel().then(appModel => {
        const savedLocation = appModel.setLocation(location);
        savedLocation.name = 'new';
        const newSavedLocation = appModel.setLocation(savedLocation);
        expect(newSavedLocation.name).to.be.equal('new');
        expect(appModel.get('locations').length).to.be.equal(1);
      });
    });
  });
});
