# Sonoff BasicR3

## Usage

### Installation

1.  [Install][GitHub Homebridge] Homebridge on your hub

    > For example, Raspberry Pi:
    >
    > 1.  [Install][Raspberry Pi OS] Raspberry Pi OS
    >     
    >     * Setup [headless][Raspberry Pi Headless] (ssh, network)
    >     * `ssh` into the Pi and change password, hostname using `sudo raspi-config`
    >
    > 1.  [Install][Homebridge Raspbian] Homebridge

1.  Install the `@blackstarzes/homebridge-sonoff-basicr3` plugin in Homebridge

1.  Add the Sonoff BasicR3 platform to the [configuration][Homebrige Configuration]:

    ```json
    {
      "bridge": {
        "name": "Homebridge"
      },
      "accessories": [],
      "platforms": [
        {
          "platform": "SonoffBasicR3"
        }
      ]
    }
    ```

1.  Add the Homebridge accessory to HomeKit

#### Bootstrap

Once ssh-ed into the Pi:

```shell
# Update
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt dist-upgrade -y

# Install Node.js
curl -sL https://deb.nodesource.com/setup_12.x | sudo bash -
sudo apt-get install -y nodejs gcc g++ make python
node -v
sudo npm install -g npm

# Install Homebridge
sudo npm install -g --unsafe-perm homebridge homebridge-config-ui-x
sudo hb-service install --user homebridge

# Install mDNS
sudo apt-get install libavahi-compat-libdnssd-dev -y
```

### Prepare your hardware for DIY mode

1.  Download the eWeLink app on [iOS][eWeLink iOS] or [Android][eWeLink Android], connect and and upgrade to the latest firmware

    > This can be quite tricky the first time.
    >
    > 1.  Without the DIY jumper installed, power on the device. The blue LED should flash `..-`.
    > 1.  Press and hold the button until the blue LED flashes `.` continuously.
    > 1.  Open the eWeLink app and add the device (requires adding it to your network - only 2.4GHz).
    > 1.  Go into the device settings and upgrade to the latest firmware.

1.  Supply mains power to the Sonoff BasicR3's input - the device should power up.

1.  Press and hold the button until the blue LED flashes `..-`.

1.  Press and hold the button until the blue LED flashes `.` continuously.

1.  Connect to the `ITEAD-XXX` access point (password is `12345678`) and navigate to http://10.10.7.1 and configure this with your SSID and password.

## Development

### Install homebridge

1.  Follow the instructions at the [GitHub Homebridge] repository

    ```shell
    sudo npm install -g --unsafe-perm homebridge
    ```

1.  In the root directory of this repository, run:

    ```shell
    npm run watch
    ```

1.  Add the hub to your home (preferably in a development home), and develop away

1.  Pull requests are welcome!

[GitHub Homebridge]: https://github.com/homebridge/homebridge
[Raspberry Pi OS]: https://www.raspberrypi.org/downloads/raspberry-pi-os/
[Raspberry Pi Headless]: https://www.raspberrypi.org/documentation/configuration/wireless/headless.md
[Homebridge Raspbian]: https://github.com/homebridge/homebridge/wiki/Install-Homebridge-on-Raspbian
[Homebrige Configuration]: https://github.com/homebridge/homebridge/wiki/Homebridge-Config-JSON-Explained
[eWeLink iOS]: https://itunes.apple.com/us/app/ewelink-smart-home-control/id1035163158?mt=8
[eWeLink Android]: https://play.google.com/store/apps/details?id=com.coolkit&hl=en
