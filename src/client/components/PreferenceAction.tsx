import React from 'react';
import type {ScoringPreference} from '../../shared/clientapi/Scoring';

const PreferenceAction = ({preference}: {preference: ScoringPreference}) => {
  return <a>{(preference as any).name}</a>;
};

export default PreferenceAction;
