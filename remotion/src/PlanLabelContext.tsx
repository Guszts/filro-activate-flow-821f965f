import { createContext, useContext } from "react";

export const PlanLabelContext = createContext<string>("START");
export const usePlanLabel = () => useContext(PlanLabelContext);
