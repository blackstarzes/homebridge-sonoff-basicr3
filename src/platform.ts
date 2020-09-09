import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import mdns from 'mdns';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { SonoffBasicR3 } from './platformAccessory';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class SonoffBasicR3HomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  // mDNS browser
  private browser?: mdns.Browser;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      // run the method to discover / register your devices as accessories
      this.discoverDevices();
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  /**
   * This method discovers devices Sonoff BasicR3 devices using mDNS.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  discoverDevices() {
    // Listen for mDNS services
    this.log.debug('Setting up mDNS browser...');
    this.browser = mdns.createBrowser(mdns.tcp('ewelink'), {
      resolverSequence: [
        mdns.rst.DNSServiceResolve(),
        'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({ families: [0] }),
        mdns.rst.makeAddressesUnique()
      ]
    });
    this.browser.on('serviceUp', (service) => this.serviceUp(service));
    this.browser.on('serviceDown', (service) => this.serviceDown(service));
    this.browser.start();
  }

  serviceUp(service: mdns.Service) {
    this.log.info(`mDNS service up: ${service.name} (id ${service.txtRecord.id}) at ${service.addresses[0]}:${service.port}`);
    const uuid = this.api.hap.uuid.generate(service.txtRecord.id);
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
    if (existingAccessory) {
      this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
      existingAccessory.context.service = service;
      this.api.updatePlatformAccessories([existingAccessory]);
      new SonoffBasicR3(this, existingAccessory, service);
    } else {
      this.log.info('Adding new accessory:', service.name);
      const accessory = new this.api.platformAccessory(service.name!, uuid);
      accessory.context.service = service;
      new SonoffBasicR3(this, accessory, service);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }

  serviceDown(service: mdns.Service) {
    this.log.info(`mDNS service down: ${service.name} (id ${service.txtRecord.id}) at ${service.addresses[0]}:${service.port}`);
  }
}
