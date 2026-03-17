import React, { useCallback } from "react";

const AccordionContext = React.createContext<{
  openIds: string[];
  toggleItem: (id: string) => void;
}>({
  openIds: [],
  toggleItem: () => {},
});

export const AccordionProvider: React.FC<{
  children: React.ReactNode;
  allowMultiple?: boolean;
}> = ({ children, allowMultiple }) => {
  const [openIds, setOpenIds] = React.useState<string[]>([]);

  const toggleItem = useCallback((id: string) => {
    setOpenIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((openId) => openId !== id);
      } else {
        return allowMultiple ? [...prev, id] : [id];
      }
    })},[allowMultiple]);
  

  return (
    <AccordionContext.Provider value={{ openIds, toggleItem }}>
      {children}
    </AccordionContext.Provider>
  );
}
export const useAccordion = () => React.useContext(AccordionContext);
export default AccordionContext;