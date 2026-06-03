import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';

interface DateRange {
  start: string;
  end: string;
}

interface BarbershopFiltersValue {
  barbershopId: string | null;
  staffId: string | null;
  dateRange: DateRange | null;
  setBarbershopId: (id: string | null) => void;
  setStaffId: (id: string | null) => void;
  setDateRange: (range: DateRange | null) => void;
}

const BarbershopFiltersContext = createContext<BarbershopFiltersValue | undefined>(undefined);

export const BarbershopFiltersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [barbershopId, setBarbershopId] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const value = useMemo(() => ({
    barbershopId,
    staffId,
    dateRange,
    setBarbershopId,
    setStaffId,
    setDateRange
  }), [barbershopId, staffId, dateRange]);

  return (
    <BarbershopFiltersContext.Provider value={value}>
      {children}
    </BarbershopFiltersContext.Provider>
  );
};

export const useBarbershopFilters = () => {
  const ctx = useContext(BarbershopFiltersContext);
  if (!ctx) throw new Error('useBarbershopFilters must be used within BarbershopFiltersProvider');
  return ctx;
};
