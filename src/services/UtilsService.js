
import { Buffer } from 'buffer';

const UINT32_MAX = 4294967295;

// #region BLE TOOLS / HELPERS


export function isValueUInt32Max(value_base64) {
  return base64StrToUInt32(value_base64) === UINT32_MAX;
}

/**
 * Util function to pretty print characteristic value as hex string
 * @param {*} value
 */
export function base64StrToHexStr(value) {
  const buffer = Buffer.from(value, 'base64');
  const bufferStr = buffer.toString('hex');

  let valueAsHex = '';
  for (let i = 0; i < bufferStr.length; i += 2) {
    valueAsHex += `0x${bufferStr[i]}${bufferStr[i + 1]} `;
  }
  return valueAsHex;
}

export function base64StrToStr(value) {
  const buffer = Buffer.from(value, 'base64');
  return buffer.toString();
}


export function base64StrToBinaryArray(value) {
  return value? Buffer.from(value, 'base64') : undefined;
}

export function base64StrToUInt8(value){
  return base64StrToBinaryArray(value)?.readUInt8();
}

export function base64StrToInt16(value){
  return base64StrToBinaryArray(value)?.readInt16LE();
}

export function base64StrToInt32(value){
  return base64StrToBinaryArray(value)?.readInt32LE();
}

export function base64StrToUInt32(value){
  return base64StrToBinaryArray(value)?.readUInt32LE();
}

export function UInt32Tobase64Str(value){
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setUint32(0, value, true);
  return binaryArrayToBase64Str(buffer);
}

export function UInt8Tobase64Str(value){
  const buffer = new ArrayBuffer(1);
  const view = new DataView(buffer);
  view.setUint8(0, value, true);
  return binaryArrayToBase64Str(buffer);
}


export function binaryArrayToBase64Str(value) {
  const buffer = Buffer.from(value, 'binary');
  return buffer.toString('base64');
}

/**
 * Util function to pretty print services and charactristics
 * @param {*} serChar
 * @returns
 */
export function prettyPrintServiceCharacteristics(serChar) {
  return Object.keys(serChar).reduce((serCharPretty, sUUID) => {
    serCharPretty[sUUID] = serChar[sUUID].map((ch) => ch.uuid);
    return serCharPretty;
  }, {});
}
// #endregion