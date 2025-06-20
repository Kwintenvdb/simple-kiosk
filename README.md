# Simple Kiosk for Home Assistant

[![HACS validation](https://github.com/Kwintenvdb/simple-kiosk/actions/workflows/validate-hacs.yml/badge.svg)](https://github.com/Kwintenvdb/simple-kiosk/actions/workflows/validate-hacs.yml)
[![Release](https://img.shields.io/github/v/release/Kwintenvdb/simple-kiosk.svg)](https://github.com/Kwintenvdb/simple-kiosk/releases)


Hides the Home Assistant header. Heavily inspired by the [kiosk-mode](https://github.com/NemesisRE/kiosk-mode) plugin, but faster and simpler. See [Motivation](#motivation).

## Installation

At some point I'll make this available via HACS. For now, follow these instructions:

1. Place `simple-kiosk.js` in `/homeassistant/www`.
2. In your main `configuration.yaml`, add:
    ```yaml
    frontend:
      extra_module_url:
        - /local/simple-kiosk.js
    ```
3. After adding it there for the first time, restart Home Assistant. You don't need to restart it for subsequent updates.

To enable Simple Kiosk on your dashboards, continue with the [Configuration](#configuration) section below.

## Configuration

Simple Kiosk can be configured per dashboard. Add this to the top of your dashboard's yml file:

```yml
kiosk_config:
  enabled: true
```

If you only want to enable Simple Kiosk for certain users, you can configure it by specifying their usernames in the `users` array. If `users` is empty or missing, the configuration will apply to all users.

```yml
kiosk_config:
  enabled: true
  users:
    - user_a
    - user_b
```

You can temporarily disable this plugin for a given dashboard page by appending the `disable_kiosk=true` query parameter to the URL. For example, if this is your current dashboard's URL: `http://homeassistant.local:8123/dashboard-my-dashboard/0`, change it to this and reload the page: `http://homeassistant.local:8123/dashboard-my-dashboard/0?disable_kiosk=true`

## Motivation

This implementation is heavily simplified and not nearly as configurable as kiosk-mode. However, it is faster.

kiosk-mode tries to intercept the creation of custom elements in deeply nested shadow DOMs, in which it then injects styles. It is a very clever, clean, and highly configurable implementation. However, due to the compounding small delays introduced by the polling, mutation observers, loading of configs, etc., performance on slower devices (for example, cheap, wall-mounted tablets) was not adequate for me. It usually resulted in the header, sidebar, or other elements appearing for a split second, before being hidden.

This implementation injects the relevant styles more quickly, and is much less reliant on polling for DOM changes. Even on slower devices, this plugin is capable of hiding the respective elements instantly. Note that this plugin is also considerably less configurable or flexible and provides only a few options.

