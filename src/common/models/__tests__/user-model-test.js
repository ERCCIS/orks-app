import _ from 'lodash';
import * as store from 'common/store';
import { UserModel } from '../user_model';

/* eslint-disable no-unused-expressions */
function initUserModel(login) {
  const userModel = new UserModel();
  return userModel._init.then(() => {
    if (login) {
      return userModel
        .logIn({
          isLoggedIn: true,
          secret: '123',
          email: '123@123.com',
          password: '123@123.com',
          name: '123',
          surname: '123',
        })
        .then(() => userModel);
    }
    return userModel;
  });
}

describe.skip('User Model', () => {
  let getStoreStub;
  let server;

  before(() => {
    getStoreStub = sinon.stub(store, 'getStore').resolves({
      getItem: () => Promise.resolve('{}'),
      setItem: () => Promise.resolve(),
    });
  });

  after(() => {
    getStoreStub.restore();
  });

  beforeEach(() => {
    server = sinon.fakeServer.create();
    return initUserModel().then(userModel => {
      userModel.resetDefaults();
    });
  });

  afterEach(() =>
    initUserModel().then(userModel => {
      userModel.resetDefaults();
      server.restore();
    })
  );

  it('has default values', () => {
    const userModel = new UserModel();
    expect(userModel.attrs.drupalID).to.be.equal('');
    expect(userModel.attrs.name).to.be.equal('');
    expect(userModel.attrs.firstname).to.be.equal('');
    expect(userModel.attrs.secondname).to.be.equal('');
    expect(userModel.attrs.email).to.be.equal('');
    expect(userModel.attrs.password).to.be.equal('');
  });

  describe('Activities support', () => {
    function getRandActivity() {
      const id = parseInt((Math.random() * 100).toFixed(0), 10);
      const activity = {
        id,
        title: '',
        description: '',
        type: '',
        activity_from_date: '2015-01-01',
        activity_to_date: '2020-01-01',
      };
      return activity;
    }

    afterEach(() => {
      if (UserModel.prototype.fetchActivities.restore) {
        UserModel.prototype.fetchActivities.restore();
      }
    });

    it('has functions', () => {
      const userModel = new UserModel();
      expect(userModel.hasActivityExpired).to.be.a('function');
      expect(userModel.syncActivities).to.be.a('function');
      expect(userModel.getActivity).to.be.a('function');
      expect(userModel.hasActivity).to.be.a('function');
    });

    it('should have attributes', () => {
      const userModel = new UserModel();
      expect(userModel.attrs.activities instanceof Array).to.be.true;
    });

    it('should sync activities from server', () => {
      const activity = getRandActivity();
      server.respondWith([
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ data: [activity] }),
      ]);

      return initUserModel().then(userModel => {
        const activitiesPromise = userModel.fetchActivities().then(() => {
          const { activities } = userModel.attrs;
          expect(activities.length).to.be.equal(1);
        });

        server.respond();
        return activitiesPromise;
      });
    });

    it('should not sync if user not logged in', () =>
      initUserModel().then(userModel => {
        userModel.logOut();
        userModel.save();

        sinon.spy(UserModel.prototype, 'fetchActivities');
        userModel = new UserModel();

        expect(userModel.fetchActivities.called).to.be.false;
        userModel.fetchActivities.restore();
      }));

    it.skip('should force fetch', done => {
      // skip because unstable async problems
      let userModel = new UserModel();
      const activity = getRandActivity();
      server.respondWith([
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ data: [activity] }),
      ]);

      // first fetch
      userModel.activities.synchronizing.then(() => {
        sinon.spy(UserModel.prototype, 'fetchActivities');
        userModel = new UserModel();
        // already fetched sync
        userModel
          .syncActivities()
          .then(() => {
            expect(userModel.fetchActivities.called).to.be.false;

            // force fetch
            userModel
              .syncActivities(true)
              .then(() => {
                expect(userModel.fetchActivities.called).to.be.true;

                userModel.fetchActivities.restore();
                done();
              })
              .catch(done);

            server.respond();
          })
          .catch(done);
      });

      server.respond();
    });

    it('should set activities.synchronizing on sync', () =>
      initUserModel(true).then(userModel => {
        expect(userModel.activities.synchronizing).to.be.instanceOf(Promise);
      }));

    it('should fire event on sync start and end', done => {
      initUserModel(true).then(userModel => {
        userModel.on('sync:activities:end', () => {
          userModel.on('sync:activities:start', done);
          userModel.syncActivities(true).catch(done);
        });

        const activity = getRandActivity();

        server.respondWith([
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify({ data: [activity] }),
        ]);
        server.respond();
      });
    });

    it('should reset activities on logout', () =>
      initUserModel().then(userModel => {
        userModel.attrs.activities = [getRandActivity(), getRandActivity()];

        userModel.logOut();
        const { activities } = userModel.attrs;
        expect(activities.length).to.be.equal(0);
      }));

    it('should check activity expiry', () => {
      const userModel = new UserModel();

      // check out of range
      const expiredActivity = getRandActivity();
      expiredActivity.activity_to_date = '2000-01-01';

      userModel.attrs.activities = [expiredActivity];

      let expired = userModel.hasActivityExpired(expiredActivity);
      expect(expired).to.be.true;

      // check a deleted one
      let activity = getRandActivity();
      expired = userModel.hasActivityExpired(activity);
      expect(expired).to.be.true;

      // check old updated one
      activity = getRandActivity();
      const notUpdatedActivity = _.cloneDeep(activity);
      activity.name = 'new name';
      userModel.attrs.activities = [activity];
      expired = userModel.hasActivityExpired(notUpdatedActivity);
      expect(expired).to.be.true;
    });

    it.skip('should remove expired activities on initialize', () => {
      // skip because of async problems somewhere
      let userModel = new UserModel();
      const expiredActivity = getRandActivity();
      expiredActivity.activity_to_date = '2000-01-01';

      userModel.attrs.activities = [expiredActivity, getRandActivity()];
      userModel.save();

      userModel = new UserModel();
      const { activities } = userModel.attrs;
      expect(activities.length).to.be.equal(1);
    });

    it('should auto fetch new activities every day', done => {
      const clock = sinon.useFakeTimers();

      initUserModel(true).then(userModel => {
        const activity = getRandActivity();
        server.respondWith([
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify({ data: [activity] }),
        ]);

        userModel.activities.synchronizing
          .then(() => {
            sinon.spy(UserModel.prototype, 'fetchActivities');

            clock.tick(1000 * 60 * 60 * 24); // 1day
            initUserModel(true).then(userModel2 => {
              userModel2.activities.synchronizing
                .then(() => {
                  expect(userModel2.fetchActivities.called).to.be.true;
                  clock.restore();
                  userModel2.fetchActivities.restore();
                  done();
                })
                .catch(done);
              server.respond();
            });
          })
          .catch(done);
        server.respond();
      });
    });

    it('should get activity by id', () => {
      const userModel = new UserModel();
      const activity = getRandActivity();
      userModel.attrs.activities = [getRandActivity(), activity];
      const activity2 = userModel.getActivity(activity.id);
      expect(activity2).to.be.deep.equal(activity);
    });

    describe('Activity', () => {
      it('should have default values', done => {
        initUserModel(true).then(userModel => {
          server.respondWith([
            200,
            { 'Content-Type': 'application/json' },
            JSON.stringify({
              data: [
                {
                  id: 1,
                  activity_from_date: '2016-05-03',
                  activity_to_date: '2016-05-25',
                },
              ],
            }),
          ]);
          userModel.activities.synchronizing.then(() => {
            const { activities } = userModel.attrs;
            const parsedActivity = activities[0];

            expect(parsedActivity).to.be.an('object');
            expect(typeof parsedActivity.id).be.equal('number');
            expect(parsedActivity.title).to.be.a('string');
            // expect(parsedActivity.description).to.be.a('string');
            // expect(parsedActivity.type).to.be.a('string');
            // expect(parsedActivity.activity_from_date).to.be.a('string');
            // expect(parsedActivity.activity_to_date).to.be.a('string');
            // expect(parsedActivity.synced_on).to.be.a('string');
            done();
          });
          server.respond();
        });
      });

      it('should complain on unfamiliar server serponse', () => {
        const userModel = new UserModel();
        userModel.fetchActivities(err => {
          expect(err).to.be.an('object');
        });

        server.respondWith([
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify([{ id: 1 }]),
        ]);
      });
    });
  });
});
