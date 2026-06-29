import stringify from 'json-stable-stringify';
import { AppModel } from 'models/app';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';

async function getAppModel() {
  const genericStoreMock = { find: async () => null, save: async () => null };
  const appModel = new AppModel({ cid: 'app', store: genericStoreMock });
  appModel.fetch();
  await appModel.ready;
  return appModel;
}

describe('App Model attr locks extension', () => {
  describe('appendAttrLocks', () => {
    it('should append locks for attributes with colon in id', async () => {
      // Given
      const appModel = await getAppModel();
      const sample = new Sample({ data: { location: { name: 'Test' } } });
      sample.occurrences.push(new Occurrence());

      const locks = {
        'occ:occAttr:466': '5331',
        'occ:occAttr:507': '5709',
      };

      // When
      appModel.appendAttrLocks(sample, locks);

      // Then
      expect(sample.occurrences[0].data['occAttr:466']).toEqual('5331');
      expect(sample.occurrences[0].data['occAttr:507']).toEqual('5709');
    });
  });

  describe('getAllLocks', () => {
    it('should return all locks', async () => {
      // Given
      const appModel = await getAppModel();

      appModel.setAttrLock('smp', 'a', 1);
      appModel.setAttrLock('occ', 'b', 2);

      // When
      const locks = appModel.getAllLocks('smp');

      // Then
      expect(stringify(locks)).toEqual(stringify({ 'occ:b': 2, 'smp:a': 1 }));
    });
  });

  describe('setAttrLock', () => {
    it('should set a new attribute lock', async () => {
      // Given
      const appModel = await getAppModel();

      // When
      appModel.setAttrLock('smp', 'a', 1);

      // Then
      const lockedVal = appModel.getAttrLock('smp', 'a');
      expect(lockedVal).toEqual(1);
    });

    it('should copy new attributes and not references', async () => {
      const appModel = await getAppModel();

      const value = { a: [1] };
      appModel.setAttrLock('smp', 'a', value);
      const lockedVal = appModel.getAttrLock('smp', 'a');
      expect(lockedVal).not.toBe(value);
      expect(lockedVal.a).not.toBe(value.a);
    });
  });

  describe('getAttrLock', () => {
    it('should retrieve locked value', async () => {
      const appModel = await getAppModel();

      appModel.data.attrLocks = { default: { default: { 'smp:a': 1 } } };
      const lockedVal = appModel.getAttrLock('smp', 'a');
      expect(lockedVal).toEqual(1);
    });

    it("should return empty if container or lock doesn't exist", async () => {
      // Given
      const appModel = await getAppModel();
      appModel.data.attrLocks = { A: {} };

      // When
      const lock = appModel.getAttrLock('smp', 'A', 'b');
      const lock2 = appModel.getAttrLock('smp', 'B', 'c');

      // Then
      expect(lock).toBeUndefined();
      expect(lock2).toBeUndefined();
    });
  });

  describe('unsetAttrLock', () => {
    it('should unset locked value', async () => {
      const appModel = await getAppModel();
      appModel.setAttrLock('smp', 'a', 1);

      appModel.unsetAttrLock('a');
      const lockedVal = appModel.getAttrLock('a');
      expect(lockedVal).toBeUndefined();
    });
  });
});
