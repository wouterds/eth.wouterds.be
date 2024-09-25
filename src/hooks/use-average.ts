import { useEffect, useState } from 'react';

export const useAverage = (currentValue: number, amount: number, round?: number) => {
  const [values, setValues] = useState<number[]>([currentValue]);

  useEffect(() => {
    setValues((prevValues) => {
      const updatedValues = [...prevValues, currentValue].slice(-amount);
      return updatedValues;
    });
  }, [currentValue, amount]);

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;

  // Round the average if the round parameter is provided
  const roundedAverage = round !== undefined ? Number(average.toFixed(round)) : average;

  return roundedAverage;
};
