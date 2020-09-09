import { Service, PlatformAccessory, CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';
import mdns from 'mdns';
import { RestClient } from 'typed-rest-client/RestClient';
import { IRequestOptions } from 'typed-rest-client/Interfaces';

import { SonoffBasicR3HomebridgePlatform } from './platform';
import { PLUGIN_NAME } from './settings';
import { OnOff, InfoData, SwitchData, Request, Response } from './sonoff';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class SonoffBasicR3 {
  private service: Service;
  private id: string;
  private hostAndPort: string;
  private client: RestClient;
  private state: InfoData;

  constructor(
    private readonly platform: SonoffBasicR3HomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly mdnsService: mdns.Service,
  ) {
    // set private properties
    this.id = mdnsService.txtRecord.id;
    this.hostAndPort = `${mdnsService.addresses[0]}:${mdnsService.port}`;
    const options: IRequestOptions = {
      headers: [
        'Content-Type: application/json',
      ],
    };
    this.client = new RestClient(PLUGIN_NAME, `http://${this.hostAndPort}`, undefined, options);
    this.state = {
      switch: OnOff.Off,
      startup: OnOff.Off,
      pulse: OnOff.Off,
      pulseWidth: 0,
      ssid: '',
      otaUnlock: false,
      fwVersion: '',
      deviceid: '',
      bssid: '',
      signalStrength: 0,
    };

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Sonoff')
      .setCharacteristic(this.platform.Characteristic.Model, 'BasicR3')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.id);
    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);
    this.service.setCharacteristic(this.platform.Characteristic.Name, mdnsService.name!);

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .on('set', this.setOn.bind(this))  // SET - bind to the `setOn` method below
      .on('get', this.getOn.bind(this)); // GET - bind to the `getOn` method below

    // poll for state
    let refreshRate = 15000;
    if (this.platform.config.refreshRate) {
      refreshRate = this.platform.config.refreshRate * 1000;
    }
    setInterval(async () => {
      try {
        const req: Request<unknown> = {
          deviceid: this.id,
          data: { },
        };
        const resp = await this.client.create<Response<InfoData>>('/zeroconf/info', req);
        this.platform.log.debug(`Fetched ${req.deviceid} state [Sequence: ${resp.result!.seq}]`);
        this.state = resp.result!.data;
      } catch(ex) {
        this.platform.log.error(ex);
      }
    }, refreshRate);
  }

  /**
   * Handle 'SET' requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    const req: Request<SwitchData> = {
      deviceid: this.id,
      data: {
        switch: value as boolean ? OnOff.On : OnOff.Off,
      },
    };
    try {
      const resp = await this.client.create<Response<unknown>>('/zeroconf/switch', req);
      this.platform.log.info(`Turned ${req.deviceid} ${req.data.switch} [Sequence: ${resp.result!.seq}]`);
      callback(null);
    } catch (ex) {
      this.platform.log.error(ex);
      callback(ex);
    }
  }

  /**
   * Handle the 'GET' requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   * 
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   * 
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getOn(callback: CharacteristicGetCallback) {
    callback(null, this.state.switch === OnOff.On);
  }
}
