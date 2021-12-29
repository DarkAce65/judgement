import { useEffect, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { LocationState } from '../constants';

import useLocationState from './useLocationState';

const useLocationStatePropertyOnce = <P extends keyof LocationState>(stateProperty: P) => {
  const location = useLocation();
  const locationState = useLocationState();
  const navigate = useNavigate();

  const [statePropertyValue, setStatePropertyValue] = useState<LocationState[P]>(
    locationState?.[stateProperty]
  );

  useEffect(() => {
    if (locationState && Object.prototype.hasOwnProperty.call(locationState, stateProperty)) {
      setStatePropertyValue(locationState[stateProperty]);
      const state = { ...locationState };
      delete state[stateProperty];
      navigate(location, { replace: true, state });
    }
  }, [location, locationState, stateProperty, navigate]);

  return statePropertyValue;
};

export default useLocationStatePropertyOnce;
