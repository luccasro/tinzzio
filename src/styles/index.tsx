import { createContext } from "react";
import '@expo/match-media';
import { useMediaQuery } from "native-base";

export const breakpoints = [544, 768, 1024, 1200, 1300]

export interface MediaQueryContextProps {
  isSmall: boolean;
  isSmallMedium: boolean;
  isMedium: boolean;
  isMediumLarge: boolean;
  isLarge: boolean;
}

export const MediaQueryContext = createContext<MediaQueryContextProps>({
  isSmall: false,
  isSmallMedium: false,
  isMedium: false,
  isMediumLarge: false,
  isLarge: false
});

  const mediaQueries = {
    small: breakpoints[0],
    smallMedium: breakpoints[1],
    medium: breakpoints[2],
    mediumLarge: breakpoints[3],
    large: breakpoints[4]
  };

export const getMediaQuery = (type: "isSmall" | "isSmallMedium" | "isMedium" | "isMediumLarge" | "isLarge") => {

  const [isSmall] = useMediaQuery({maxWidth: mediaQueries.small})
  const [isSmallMedium] = useMediaQuery({maxWidth: mediaQueries.smallMedium});
  const [isMedium] = useMediaQuery({maxWidth: mediaQueries.medium});
  const [isMediumLarge] = useMediaQuery({maxWidth: mediaQueries.mediumLarge});
  const [isLarge] = useMediaQuery({maxWidth: mediaQueries.large});

  let value: boolean | undefined = undefined
  switch(type){
    case "isSmall" : 
    value = isSmall
    break;
    case "isSmallMedium" : 
    value = isSmallMedium
    break;
    case "isMedium" : 
    value = isMedium
    break;
    case "isMediumLarge" : 
    value = isMediumLarge
    break;
    case "isLarge" : 
    value = isLarge
    break;
  }

  return value
};