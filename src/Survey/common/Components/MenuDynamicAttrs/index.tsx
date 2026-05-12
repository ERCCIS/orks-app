import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { BlockT } from 'common/flumens';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import MenuAttr from 'Survey/common/Components/MenuAttr';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import MenuTaxonItem from 'Survey/common/Components/MenuTaxonItem';
import { AttrConfig } from 'Survey/common/config';
import './styles.scss';

type Props = {
  model: Sample | Occurrence;
  attr: BlockT | AttrConfig;
  skipLocks?: boolean;
  useSeparateOccPage?: boolean;
};

const MenuDynamicAttr = ({
  model,
  attr,
  skipLocks,
  useSeparateOccPage,
}: Props) => {
  const { url } = useRouteMatch();

  if (!(model instanceof Occurrence) && useSeparateOccPage)
    throw new Error(
      'useSeparateOccPage can only be used with occurrence model.'
    );

  const { id } = attr;

  if (id === 'taxon')
    return <MenuTaxonItem key={id} occ={model as Occurrence} />;

  if (id === 'location') {
    const label =
      'title' in attr ? attr.title : (attr as AttrConfig).menuProps?.label;

    return (
      <MenuLocation.WithLock
        key={id}
        sample={model as Sample}
        skipLocks={skipLocks}
        label={label}
      />
    );
  }

  let routerLink = `${url}/${id}`;
  if (useSeparateOccPage) {
    routerLink = `${url}/occ/${model.cid}/${id}`;
  }

  if (skipLocks)
    return (
      <MenuAttr
        key={id}
        model={model}
        attr={attr}
        className="menu-attr-item"
        itemProps={{ routerLink }}
      />
    );

  return (
    <MenuAttr.WithLock
      key={id}
      model={model}
      attr={attr}
      itemProps={{ routerLink }}
    />
  );
};

export default observer(MenuDynamicAttr);
