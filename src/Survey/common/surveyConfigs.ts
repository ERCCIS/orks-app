import defaultSurvey from 'Survey/Default/config';
import listSurvey from 'Survey/List/config';
import mothSurvey from 'Survey/Moth/config';
import plantSurvey from 'Survey/Plant/config';

const getSurveyConfigs = () => ({
  [defaultSurvey.id]: defaultSurvey,
  [listSurvey.id]: listSurvey,
  [plantSurvey.id]: plantSurvey,
  [mothSurvey.id]: mothSurvey,
});

export default getSurveyConfigs;
