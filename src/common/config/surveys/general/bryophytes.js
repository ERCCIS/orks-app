export default {
  name: 'bryophytes',
  taxonGroups: [133, 129],
  editForm: [
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
    smp: {
      habitat: {
        type: 'radio',
        id: 208,
        label: 'Habitat',
        icon: 'land',
        default: '',
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
      microscopicallyChecked: {
        type: 'toggle',
        id: 470,
        label: 'Microscopically Checked',
        default: false,
      },
      fruit: {
        type: 'toggle',
        id: 471,
        label: 'Fruit',
        default: false,
      },
      male: {
        type: 'toggle',
        id: 475,
        label: 'Male',
        default: false,
      },
      female: {
        type: 'toggle',
        id: 476,
        label: 'Female',
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
  },
};
