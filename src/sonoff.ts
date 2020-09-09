export enum OnOff {
  On = 'on',
  Off = 'off'
}

export interface InfoData {
  switch: string,
  startup: string,
  pulse: string,
  pulseWidth: number,
  ssid: string,
  otaUnlock: boolean,
  fwVersion: string,
  deviceid: string,
  bssid: string,
  signalStrength: number
}

export interface SwitchData {
  switch: string;
}

export interface Request<T> {
  deviceid: string;
  data: T;
}

export interface Response<T> {
  seq: number,
  error: string,
  data: T
}
  