import * as React from "react"
import Svg, { Path } from "react-native-svg"
/* SVGR has dropped some elements not supported by react-native-svg: title */

const MonitorIcon = (props) => (
  <Svg
    data-name="Layer 1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 121.7 122.88"
    {...props}
  >
    <Path d="M17.67 53.08h8.22l6.82-13.82 12.43 17.91 12.7-24.75 13.26 26 4.54-4.16 3-1.18h10.92v.53a35.81 35.81 0 0 1-1 8.35h-8.21L68.5 72.84l-10.7-21-11.52 22.49L34 56.65 31.39 62H18.63a36.35 36.35 0 0 1-1-8.35v-.53ZM53.61 0a53.63 53.63 0 0 1 44.88 83l23.21 25.29-16 14.63-22.39-24.66A53.62 53.62 0 1 1 53.61 0Zm29.6 24a41.81 41.81 0 1 0 12.28 29.6A41.77 41.77 0 0 0 83.21 24Z" />
  </Svg>
)

export default MonitorIcon