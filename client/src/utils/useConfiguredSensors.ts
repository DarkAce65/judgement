import { KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

const useConfiguredSensors = () =>
  useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 20 } }),
    useSensor(KeyboardSensor)
  );

export default useConfiguredSensors;
