import type { ChoiceInputConf, NumberInputConf } from '@flumens';
import fingerprintIcon from 'common/images/fingerprint.svg';
import numberIcon from 'common/images/number.svg';
import progressIcon from 'common/images/progress-circles.svg';
import { toChoices } from './common';

const stageOptions = [
  { label: 'Not Recorded', value: null, isDefault: true },
  { value: 'Male', id: 3484 },
  { value: 'Pre-adult', id: 1951 },
  { value: 'Female', id: 3483 },
  { value: 'Other', id: 1952 },
  { value: 'Adult', id: 3405 },
  { value: 'Adult male', id: 3406 },
  { value: 'Adult female', id: 3407 },
  { value: 'Juvenile', id: 3408 },
  { value: 'Juvenile male', id: 3409 },
  { value: 'Juvenile female', id: 3410 },
  { value: 'Breeding pair', id: 3411 },
  {
    value:
      'If a group contained mixed adults and juveniles, both male, female or unknown',
    id: 5262,
  },
  { value: 'Mixed group', id: 5261 },
  { value: 'In flower', id: 3412 },
  { value: 'Fruiting', id: 3413 },
  { value: 'Egg', id: 3956 },
  { value: 'Larva', id: 3957 },
  { value: 'Nymph', id: 3959 },
  { value: 'Spawn', id: 3960 },
  { value: 'Pupa', id: 3958 },
  { value: 'Exuviae', id: 14241 },
  { value: 'Other (please add to comments)', id: 3414 },
] as const;

const typeOptions = [
  { value: 'Bat Breeding Roost', id: 5296 },
  { value: 'Bat Detected', id: 5299 },
  { value: 'Bat Grounded', id: 7799 },
  { value: 'Bat Hibernacula', id: 5294 },
  { value: 'Bat in hand', id: 21902 },
  { value: 'Bat Roost', id: 3924 },
  { value: 'Burrow', id: 3391 },
  { value: 'Colony', id: 5667 },
  { value: 'Dead', id: 3385 },
  { value: 'Dead on road', id: 3386 },
  { value: 'Dung or droppings', id: 3388 },
  { value: 'Feeding remains', id: 3387 },
  { value: 'Living organism', id: 21966 },
  { value: 'Nest', id: 3392 },
  { value: 'Tracks or trail', id: 3389 },
  { value: 'Heard', id: 3384 },
  { value: 'Other (please add to comments)', id: 3393 },
] as const;

export const numberAttrOld = {
  id: 'number',
  remote: { id: 93 },
} as const;

export const numberAttr = {
  id: 'occAttr:93',
  type: 'numberInput',
  container: 'inline',
  appearance: 'slider',
  validation: { max: 500 },
} as const satisfies NumberInputConf;

export const numberPageAttr = {
  ...numberAttr,
  title: 'Abundance',
  prefix: <img src={numberIcon} alt="" className="size-6" />,
  container: 'page',
  description: 'How many individuals of this species did you see?',
} as const satisfies NumberInputConf;

export const stageAttrOld = {
  id: 'stage',
  remote: { id: 218, values: stageOptions },
} as const;

export const stageAttr = {
  id: 'occAttr:218',
  title: 'Life Stage/Sex',
  prefix: <img src={fingerprintIcon} alt="" className="size-6" />,
  type: 'choiceInput',
  appearance: 'button',
  description:
    'Please pick the life stage and sex of the organism, if recorded.',
  choices: toChoices(stageOptions),
} as const satisfies ChoiceInputConf;

export const typeAttrOld = {
  id: 'type',
  remote: { id: 217, values: typeOptions },
} as const;

export const typeAttr = {
  id: 'occAttr:217',
  title: 'Type',
  prefix: <img src={progressIcon} alt="" className="size-6" />,
  type: 'choiceInput',
  appearance: 'button',
  description: 'Please pick the type of observation.',
  validation: { required: true },
  choices: toChoices(typeOptions),
} as const satisfies ChoiceInputConf;
