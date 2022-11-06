import { KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

export const useConfiguredSensors = () =>
  useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 20 } }),
    useSensor(KeyboardSensor)
  );
