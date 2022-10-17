import { FC } from 'react';
import { IonList } from '@ionic/react';
import { Page, Header, Main } from '@flumens';
import PhotoPicker from 'Survey/common/Components/PhotoPicker';
import MenuDynamicAttrs from 'Survey/common/Components/MenuDynamicAttrs';
import MenuTaxonItem from 'Survey/common/Components/MenuTaxonItem';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import Sample from 'models/sample';
import { observer } from 'mobx-react';

type Props = {
  subSample: Sample;
};

const PlantOccurrenceHome: FC<Props> = ({ subSample: sample }) => {
  const [occ] = sample.occurrences;

  return (
    <Page id="survey-default-edit">
      <Header title="Edit" />

      <Main>
        <IonList lines="full">
          <div className="rounded">
            <PhotoPicker model={occ} />
          </div>

          <div className="rounded">
            <MenuTaxonItem occ={occ} />
            <MenuLocation sample={sample} skipName />
            <MenuDynamicAttrs model={sample} />
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(PlantOccurrenceHome);
