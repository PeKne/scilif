
import { Buffer } from 'buffer';

// #region BLE TOOLS / HELPERS

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

export function base64StrToBinaryArray(value) {
  return Buffer.from(value, 'base64');
}

export function base64StrToUInt8(value){
  return base64StrToBinaryArray(value).readUInt8();
}

export function base64StrToInt16(value){
  return base64StrToBinaryArray(value).readInt16LE();
}

export function base64StrToInt32(value){
  return base64StrToBinaryArray(value).readInt32LE();
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