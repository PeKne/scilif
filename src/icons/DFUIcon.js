import * as React from "react"
import Svg, { Path } from "react-native-svg"
/* SVGR has dropped some elements not supported by react-native-svg: title */

const  DFUIcon = (props) => (
  <Svg
    data-name="Layer 1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 122.88 122.02"
    {...props}
  >
    <Path d="M23.28,94.67H23a50.6,50.6,0,0,0,88.87-33.1,5.36,5.36,0,0,1,10.71,0A61.3,61.3,0,0,1,17.54,104.48v12.35a5.36,5.36,0,0,1-10.72,0V89.31A5.36,5.36,0,0,1,12.18,84h3.91a50.57,50.57,0,0,0,7.19,10.71Zm38-72.91A39.68,39.68,0,1,1,21.62,61.44,39.68,39.68,0,0,1,61.31,21.76ZM55.1,83.41H67.55A4.48,4.48,0,0,0,72,78.93V63.45h7.91A3.72,3.72,0,0,0,83.09,62c1.66-2.49-.6-5-2.17-6.68-4.47-4.89-14.57-13.76-16.77-16.35a3.64,3.64,0,0,0-5.71,0C56.17,41.59,45.52,51,41.28,55.75,39.81,57.4,38,59.66,39.52,62a3.76,3.76,0,0,0,3.17,1.49h7.93V78.93a4.49,4.49,0,0,0,4.48,4.48Zm51.5-78a5.36,5.36,0,1,1,10.71,0V33.14A5.36,5.36,0,0,1,112,38.49h-5.65A50.42,50.42,0,0,0,99,27.78h0a51,51,0,0,0-6.48-6.07l0,0L91.62,21l-.1-.07-.11-.08-.21-.16L91,20.61l0,0-.22-.16-.42-.3L90.13,20A50.51,50.51,0,0,0,25.6,25.73c-.31.31-.62.62-.92.94l-.35.37-.06.07-.35.37A50.45,50.45,0,0,0,10.71,61.57,5.36,5.36,0,1,1,0,61.57,61.31,61.31,0,0,1,91.07,8,61.83,61.83,0,0,1,106.6,20.27V5.36Z"/>
  </Svg>
)

export default DFUIcon 