export default {
  name: 'bryophytes',
  taxonGroups: [133, 129],
  render: [
    'smp:habitat',
    'occ:microscopicallyChecked',
    'occ:fruit',
    'occ:male',
    'occ:female',
    'occ:bulbils',
    'occ:gemmae',
    'occ:tubers',
  ],

  attrs: {
    habitat: {
      type: 'radio',
      id: 208,
      label: 'Habitat',
      icon: 'land',
      default: 'Not selected',
      values: {
        'Arable land, gardens or parks': 1598,
        'Bogs and fens': 1538,
        Coast: 1522,
        Grassland: 1550,
        'Heathland, scrub, hedges': 1562,
        'Industrial and urban': 1604,
        'Inland water': 1530,
        'Mixed habitats': 1616,
        'Unvegetated or sparsely vegetated habitats': 1586,
        Woodland: 1574,
      },
    },
  },
  occ: {
    attrs: {
      number: null, // override incrementShortcut

      microscopicallyChecked: {
        type: 'toggle',
        id: 470,
        icon: 'magnify',
        label: 'Microscopically Checked',
        default: false,
      },
      fruit: {
        type: 'toggle',
        id: 471,
        label: 'Fruit',
        icon: 'fruit',
        default: false,
      },
      male: {
        type: 'toggle',
        id: 475,
        label: 'Male',
        icon: 'gender',
        default: false,
      },
      female: {
        type: 'toggle',
        id: 476,
        label: 'Female',
        icon: 'gender',
        default: false,
      },
      bulbils: {
        type: 'toggle',
        id: 472,
        label: 'Bulbils',
        default: false,
      },
      gemmae: {
        type: 'toggle',
        id: 473,
        label: 'Gemmae',
        default: false,
      },
      tubers: {
        type: 'toggle',
        id: 474,
        label: 'Tubers',
        default: false,
      },
    },
    verify(attrs) {
      if (!attrs.taxon) {
        return { taxon: "can't be blank" };
      }
      return null;
    },
  },
};
