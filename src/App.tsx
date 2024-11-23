import { observer } from 'mobx-react';
import { IonApp } from '@ionic/react';
import 'common/theme.scss';
import 'common/translations/translator';
import OnboardingScreens from './Info/OnboardingScreens';

const App = () => (
  <IonApp>
    <OnboardingScreens>Hello</OnboardingScreens>
  </IonApp>
);

export default observer(App);
