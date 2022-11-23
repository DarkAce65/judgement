import { useLocation } from 'react-router-dom';

import { LocationState } from '../constants';

const useLocationState = (): LocationState | null => {
  const location = useLocation();
  if (!location.state) {
    return null;
  }

  const locationState = location.state;
  if (
    locationState !== null &&
    typeof locationState === 'object' &&
    !Array.isArray(locationState)
  ) {
    return locationState as LocationState;
  }

  return null;
};

export default useLocationState;
