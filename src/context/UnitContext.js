import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUnit, saveUnit, convertAllWorkoutWeights } from '../storage/storage';

const UnitContext = createContext({ unit: 'lbs', setUnitAndConvert: async () => {} });

export function UnitProvider({ children }) {
  const [unit, setUnit] = useState('lbs');

  useEffect(() => {
    getUnit().then(setUnit);
  }, []);

  const setUnitAndConvert = async (newUnit) => {
    if (newUnit === unit) return;
    await convertAllWorkoutWeights(unit, newUnit);
    await saveUnit(newUnit);
    setUnit(newUnit);
  };

  return (
    <UnitContext.Provider value={{ unit, setUnitAndConvert }}>
      {children}
    </UnitContext.Provider>
  );
}

export const useUnit = () => useContext(UnitContext);
