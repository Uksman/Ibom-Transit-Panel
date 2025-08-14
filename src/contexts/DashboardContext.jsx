import { createContext, useContext, useState } from "react";

const DashboardContext = createContext();
export { DashboardContext };

export const DashboardProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <DashboardContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
