import { useEffect, useState } from 'react';

import { useHistory, useLocation } from 'react-router-dom';

import { LocationState } from '../constants';

const useLocationStatePropertyOnce = <P extends keyof LocationState>(stateProperty: P) => {
  const history = useHistory();
  const location = useLocation<LocationState>();

  const [statePropertyValue, setStatePropertyValue] = useState<LocationState[P]>(
    location.state?.[stateProperty]
  );

  useEffect(() => {
    if (location.state && Object.prototype.hasOwnProperty.call(location.state, stateProperty)) {
      setStatePropertyValue(location.state[stateProperty]);
      const state = { ...location.state };
      delete state[stateProperty];
      history.replace({ ...history.location, state });
    }
  }, [history, location, stateProperty]);

  return statePropertyValue;
};

export default useLocationStatePropertyOnce;
