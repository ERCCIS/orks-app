import { observer } from 'mobx-react';
import Badge from '@flumens/tailwind/dist/components/Badge';
import { getPrettyBlockValue } from '@flumens/tailwind/dist/components/Block';
import { limit } from 'common/flumens';
import appModel from 'models/app';
import Occurrence from 'models/occurrence';

type Props = {
  occ?: Occurrence;
};

const Attributes = ({ occ }: Props) => {
  if (!occ) return null;

  const survey = occ.parent!.getSurvey();
  const surveyName = occ.parent!.parent?.getSurvey().name || survey.name;
  const coreTaxa = ['default', 'list'].includes(surveyName) ? 'all' : undefined;
  const render = survey.occ?.render;
  const blocks = typeof render === 'function' ? render(occ) : render || [];
  const getAttribute = (title: string) => {
    const block = blocks.find(attr => attr.title === title);
    const rawValue =
      block?.type === 'group' ? occ.data : occ.data[block?.id || ''];
    return {
      block,
      value: block && limit(getPrettyBlockValue(rawValue, block)),
      locked:
        block &&
        appModel.locks.isLocked(
          surveyName,
          survey.taxa,
          'occ',
          block.id,
          rawValue
        ),
    };
  };

  const number = getAttribute('Abundance');
  const stage = getAttribute('Life Stage/Sex');
  const type = getAttribute('Type');
  const { comment } = occ.data;
  const commentLocked = appModel.locks.isLocked(
    surveyName,
    coreTaxa,
    'occ',
    'comment',
    comment
  );

  return (
    <div className="flex flex-nowrap text-xs [&>*:not(:empty)]:mr-2">
      {!!number.value && (
        <Badge
          size="small"
          className={`text-xs ${number.locked ? 'locked' : ''}`}
        >
          {number.value}
        </Badge>
      )}
      {!!stage.value && (
        <Badge
          size="small"
          className={`text-xs ${stage.locked ? 'locked' : ''}`}
        >
          {stage.value}
        </Badge>
      )}
      {!!type.value && (
        <Badge
          size="small"
          className={`text-xs ${type.locked ? 'locked' : ''}`}
        >
          {type.value}
        </Badge>
      )}

      {!!comment && (
        <Badge className={`text-xs ${commentLocked ? 'locked' : ''}`}>
          {comment}
        </Badge>
      )}
    </div>
  );
};

export default observer(Attributes);
