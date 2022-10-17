import { FC, useState } from 'react';
import {
  IonItemDivider,
  IonButtons,
  IonToolbar,
  IonHeader,
  IonTitle,
  IonButton,
  IonModal,
  IonRadio,
  IonCheckbox,
  IonLabel,
  IonItem,
  IonRadioGroup,
} from '@ionic/react';
import { Main } from '@flumens';
import appModel from 'models/app';
import { Trans as T, useTranslation } from 'react-i18next';
import informalGroups from 'common/data/informal_groups.data.json';
import './styles.scss';

const Header: FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();

  const toggleModal = () => setShowModal(!showModal);

  const onSearchNamesFilterSelect = (e: any) => {
    const filter = e.target.value;
    if (filter === appModel.attrs.searchNamesOnly) {
      return;
    }
    appModel.attrs.searchNamesOnly = filter;
    appModel.save();
  };

  const onSearchTaxaFilterSelect = (e: any) => {
    const filter = parseInt(e.target.value, 10);
    appModel.toggleTaxonFilter(filter);
  };

  const getFiltersModal = () => {
    const filters = Object.keys(informalGroups)
      .sort((a: string, b: string) =>
        t((informalGroups as any)[a]).localeCompare(
          t((informalGroups as any)[b])
        )
      )
      .map((id: string) => ({ id, label: (informalGroups as any)[id] }));

    const { searchNamesOnly, taxonGroupFilters: selectedFilters } =
      appModel.attrs;

    const filtersList = filters.map((_, i) => (
      <IonItem key={filters[i].id}>
        <IonLabel class="filter-label">{t(filters[i].label)}</IonLabel>
        <IonCheckbox
          value={filters[i].id}
          onIonChange={onSearchTaxaFilterSelect}
          checked={selectedFilters.indexOf(parseInt(filters[i].id, 10)) >= 0}
        />
      </IonItem>
    ));

    const form = (
      <div id="filters-dialog-form">
        <IonItemDivider>
          <T>Names:</T>
        </IonItemDivider>
        <IonRadioGroup
          value={searchNamesOnly || ''}
          className="taxa-filter-edit-dialog-form"
          onIonChange={onSearchNamesFilterSelect}
        >
          <IonItem>
            <IonLabel>
              <T>Default</T>
            </IonLabel>
            <IonRadio value="" />
          </IonItem>
          <IonItem>
            <IonLabel>
              <T>Common only</T>
            </IonLabel>
            <IonRadio value="common" />
          </IonItem>
          <IonItem>
            <IonLabel>
              <T>Scientific only</T>
            </IonLabel>
            <IonRadio value="scientific" />
          </IonItem>
        </IonRadioGroup>

        <div className="taxon-groups taxa-filter-edit-dialog-form">
          <IonItemDivider>
            <T>Taxon groups:</T>
          </IonItemDivider>
          {filtersList}
        </div>
      </div>
    );

    return (
      <IonModal isOpen={showModal}>
        <IonHeader translucent>
          <IonToolbar>
            <IonTitle>Filters</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={toggleModal}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <Main fullscreen>{form}</Main>
      </IonModal>
    );
  };

  const isFiltering =
    appModel.attrs.searchNamesOnly || appModel.attrs.taxonGroupFilters.length;

  const filtersCount =
    (appModel.attrs.searchNamesOnly ? 1 : 0) +
    appModel.attrs.taxonGroupFilters.length;

  return (
    <>
      {getFiltersModal()}
      <IonButton
        onClick={toggleModal}
        className="filter-button"
        color={isFiltering ? 'warning' : ''}
        fill="outline"
      >
        <T>Filters</T> {!!isFiltering && <b>({filtersCount})</b>}
      </IonButton>
    </>
  );
};

export default Header;
