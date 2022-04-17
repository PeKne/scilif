import {useContext, createContext} from 'react';

export const CustomContext = createContext();

export const useCustomContext = () => useContext(CustomContext);
