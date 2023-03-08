import {createContext, type ReactNode, useContext, type FC} from 'react';
export const NonceContext = createContext<string | undefined>(undefined);
export const NonceProvider: FC<{ children: ReactNode; nonce: string|undefined }> = ({ nonce, children }) => {
  return <NonceContext.Provider value={nonce}>{children}</NonceContext.Provider>;
};
export const useNonce = () => {
  const nonce = useContext(NonceContext);
  /** NOTE: We are not checking for 'undefined' because it will be undefined during the render. **/
  return nonce;
};


