import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { InfoMessage, Main } from '@flumens';
import { IonButton, IonLabel, IonList } from '@ionic/react';
import Sample from 'models/sample';
import DisabledRecordMessage from 'Survey/common/Components/DisabledRecordMessage';
import MenuAttr from 'Survey/common/Components/MenuAttr';
import MenuDynamicAttrs from 'Survey/common/Components/MenuDynamicAttrs';
import SpeciesList from 'Survey/common/Components/SpeciesList';
import './styles.scss';

type Props = {
  sample: Sample;
  onDelete: any;
  showChildSampleDistanceWarning: boolean;
};

const HomeMain = ({
  sample,
  onDelete,
  showChildSampleDistanceWarning,
}: Props) => {
  const { url } = useRouteMatch();

  // calculate unique taxa
  const uniqueTaxa: any = {};
  sample.samples.forEach(childSample => {
    const [occ] = childSample.occurrences;
    if (occ) {
      const { taxon } = occ.attrs;
      uniqueTaxa[taxon?.warehouse_id as any] = true;
    }
  });

  // show activity title.
  const { activity } = sample.attrs;

  const isDisabled = sample.isDisabled();

  return (
    <Main>
      <IonList lines="full">
        {isDisabled && (
          <div className="rounded">
            <DisabledRecordMessage sample={sample} />
          </div>
        )}

        {/* Only showing if pre-selected */}
        {activity && (
          <div className="rounded">
            <MenuAttr.WithLock model={sample} attr="activity" />
          </div>
        )}

        <div className="rounded">
          {showChildSampleDistanceWarning && (
            <InfoMessage color="warning">
              Some species are located far from the survey area. Please check
              that this is correct.
            </InfoMessage>
          )}
          <MenuDynamicAttrs model={sample} skipLocks />
        </div>
      </IonList>

      {!isDisabled && (
        <IonButton
          color="primary"
          expand="block"
          id="add"
          routerLink={`${url}/taxon`}
        >
          <IonLabel>
            <T>Add Species</T>
          </IonLabel>
        </IonButton>
      )}

      <SpeciesList sample={sample} onDelete={onDelete} useSubSamples />
    </Main>
  );
};

export default observer(HomeMain);
