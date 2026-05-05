import { createContext, useContext } from "react";

interface ModuleComposerContextType {
  moduleId: string;
  basePath: string;
  pagesApiUrl: string;
}

export const ModuleComposerContext = createContext<ModuleComposerContextType | null>(null);

export function useModuleComposer() {
  return useContext(ModuleComposerContext);
}
