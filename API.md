# Sensi Thermostats by Emerson API Documentation

### Emit/Publish

### set_temperature

sets the temperature and mode for the thermostat

#### Request

#### Example body

```json
{
    "icd_id":"0a-50-30-62-eb-18-ff-ff",
    "mode":"cool",
    "target_temp":79,
    "scale":"f"
}
```
##### Fields
| Field| Data Type| Description|
| ----------- | ----------- | ----------- |
| icd_id|string|identifier of the thermostat|
|mode|enum<br>values: heat,aux,cool,auto|operational mode of the thermostat|
|target_temp|int|temperature for thermostat|
|scale|enum <br>values: f = fahrenheit, c = celsius|temperature scale|

### set_operating_mode

changes the thermostat operating mode to heat, cool, or off

#### Request
##### Example body

```json
{
    "icd_id":"0a-50-30-62-eb-18-ff-ff",
    "value":"heat"
}
```
##### Fields
| Field| Data Type |Description|
| ----------- |  ----------- | ----------- |
| icd_id|string|identifier of the thermostat|
|value|enum<br>values:heat,cool,off|operational mode of the thermostat|

### set_fan_mode

turn the fan on or off

#### Request
##### Example body

```json
{
    "icd_id":"0a-50-30-62-eb-18-ff-ff",
    "value":"on"
}
```
##### Fields
| Field| Data Type |Description|
| ----------- |  ----------- | ----------- |
| icd_id|string|identifier of the thermostat|
|value|enum<br>values:on,auto|operational mode of the fan|

### get_schedule_projection

Find the upcoming changes to the target temperature.

#### Request
##### Example body

```json
{
    "scale":"f",
    "icd_id":"0a-50-30-62-eb-18-ff-ff"
}
```

#### Fields
| Field| Data Type |Description|
| ----------- |  ----------- | ----------- |
| icd_id|string|identifier of the thermostat|
|scale|enum <br>values: f = fahrenheit, c = celsius|temperature scale|

#### Response
##### Example body
```json
{
    "icd_id": "0a-50-30-62-eb-18-ff-ff",
    "schedule_id": 12560564,
    "mode": "cool",
    "hold": { "type": "temporary", "end": 1648346400, "cool": 78 },
    "projection": [
        { "start": 1648322531, "cool": 78 },
        { "start": 1648346400, "cool": 78 },
        { "start": 1648375200, "cool": 75 }
    ]
}
```
#### Fields
| Field| Data Type |Description|
| ----------- |  ----------- | ----------- |
| icd_id|string|identifier of the thermostat|
|schedule_id|int|unknown|
|mode|enum<br>values: heat,cool|current operating mode|
|hold|strut|optional: temperature hold in place|
|hold.type|enum<br>values:temporary,| type of hold |
|hold.end|unix epoch time| time the hold will end |
|projection|strut|upcoming changes to the target temperature|
|projection.start|unix epoch time|time when the temperature will change|
|projection.cool|int|target cooling temperature|
|projection.heat|int|target heating temperature|



### get_weather
Provides the current weather and forecast for a postal code.

#### Request
##### Example body

```json
{
    "postal_code":"10042",
    "scale":"f"
}
```
#### Fields
| Field| Data Type |Description|
| ----------- |  ----------- | ----------- |
| postal_code |string|postal code - to figure out internationalization|
|scale|enum <br>values: f = fahrenheit, c = celsius|temperature scale|


#### Response
##### Example body
```json
{
    "city": "New York",
    "state": "Ny",
    "high_temp": 59.81,
    "low_temp": 43.28,
    "current_temp": 58.05,
    "weather": "Clear",
    "icon": "https://s3.amazonaws.com/sensi-weather-icons/clear-day.png"
}
```
#### Fields
| Field| Data Type |Description|
| ----------- |  ----------- | ----------- |
| city |string|city|
| state |string|state|
|high_temp|decimal|forecasted high temperature; always for the current date|
|low_temp|decimal|forecasted low temperature; always for the current date|
|current_temp|decimal|current temperature for the location|
|weather|string|description of current condition|
|icon|url|S3 location for the image|

### set_temp_offset

Used to adjust the temperature used by the thermostat from what's read. This is useful when trying to create a remote temperature sensor.

#### Request
##### Example body

```json
{
    "icd_id":"0a-50-30-62-eb-18-ff-ff",
    "value":0
}
```
#### Fields
| Field| Data Type |Description|
| ----------- |  ----------- | ----------- |
| icd_id|string|identifier of the thermostat|
| value|int|adjustment to the temperature read at the thermostat|

## Events/Topics

### state

#### message format
```json
[
  {
    "icd_id": "0a-50-30-62-eb-18-ff-ff",
    "registration": {
      "city": "New York",
      "name": "Upstairs",
      "state": "Ny",
      "country": "US",
      "address1": "Who Knows",
      "address2": null,
      "timezone": "America/New_York",
      "postal_code": "10045",
      "product_type": "Sensi Classic with HomeKit",
      "contractor_id": null,
      "fleet_enabled": false,
      "fleet_enabled_date": null
    },
    "state": {
      "status": "online",
      "current_cool_temp": 75,
      "current_heat_temp": 70,
      "display_temp": 71,
      "current_operating_mode": "heat",
      "humidity": 32,
      "battery_voltage": 3.131,
      "power_status": "c_wire",
      "wifi_connection_quality": 56,
      "periodicity": 0,
      "comfort_alert": null,
      "other_error_bitfield": {
        "bad_temperature_sensor": "off",
        "bad_humidity_sensor": "off",
        "stuck_key": "off",
        "high_voltage": "off",
        "e5_alert": "off",
        "error_32": "off",
        "error_64": "off"
      },
      "current_humidification_percent": 5,
      "current_dehumidification_percent": 40,
      "relay_status": {
        "w": "off",
        "w2": "off",
        "g": "off",
        "y": "off",
        "y2": "off",
        "o_b": "off"
      },
      "demand_status": {
        "humidification": 0,
        "dehumidification": 0,
        "overcooling": "no",
        "cool_stage": null,
        "heat_stage": null,
        "aux_stage": null,
        "heat": 0,
        "fan": 0,
        "cool": 0,
        "aux": 0,
        "last": "heat",
        "last_start": null
      },
      "hashedSchedule": "150b8aeaef611ecb9090242ac120002",
      "display_scale": "f",
      "heat_max_temp": 99,
      "cool_min_temp": 45,
      "hold_mode": "off",
      "operating_mode": "heat",
      "scheduling": "on",
      "fan_mode": "auto",
      "display_humidity": "on",
      "continuous_backlight": "off",
      "compressor_lockout": "off",
      "early_start": "off",
      "keypad_lockout": "off",
      "temp_offset": 0,
      "humidity_offset": 0,
      "aux_cycle_rate": "medium",
      "cool_cycle_rate": "medium",
      "heat_cycle_rate": "medium",
      "aux_boost": "on",
      "heat_boost": "on",
      "cool_boost": "on",
      "dst_offset": 60,
      "dst_observed": "yes",
      "tz_offset": -300,
      "hold_end": null,
      "deadband": 2,
      "display_time": "on",
      "partial_keypad_lockout": {
        "setpoint": "on",
        "system_mode": "on",
        "fan_mode": "on",
        "schedule_mode": "on",
        "settings_menu": "on"
      },
      "lcd_sleep_mode": null,
      "night_light": null,
      "outdoor_weather_display": "ff:00:00:ff:ff:ff:00:00:ff:00:00:ff:00:00:ff:00:00:ff:00",
      "circulating_fan": { "enabled": "off", "duty_cycle": 30 },
      "humidity_control": {
        "humidification": {
          "target_percent": 5,
          "enabled": "off",
          "mode": "humidifier"
        },
        "dehumidification": {
          "target_percent": 40,
          "enabled": "off",
          "mode": "overcooling"
        },
        "status": "none"
      },
      "geofencing": null,
      "remote_sensor_status": "00",
      "control": {
        "mode": "scheduling",
        "devices": null,
        "geo_state": null,
        "device_data": null
      }
    }
  }
]

```
#### fields
| Field| Description|
| ----------- | ----------- |
| icd_id|identifier of the thermostat|

### get_capabilities

#### Request
```json
{
  "scale":"f",
  "icd_id":"0a-50-30-62-eb-18-ff-ff"
}
```
#### Response
```json
{
  "last_changed_timestamp": 1648112349,
  "early_start": "yes",
  "boost": { "aux": "no", "cool": "no", "heat": "yes" },
  "aux_cycle_rate": "yes",
  "cool_cycle_rate": "yes",
  "heat_cycle_rate": "yes",
  "dual_fuel_outdoor_temperature_setpoint": "no",
  "compressor_lockout": "yes",
  "aux_cycle_rate_steps": ["slow", "medium", "fast"],
  "cool_cycle_rate_steps": ["slow", "medium", "fast"],
  "heat_cycle_rate_steps": ["slow", "medium", "fast"],
  "keypad_lockout": "yes",
  "continuous_backlight": "yes",
  "degrees_fc": "yes",
  "temp_offset": "yes",
  "humidity_offset": "yes",
  "display_humidity": "yes",
  "display_outdoor_temp": "yes",
  "display_time": "yes",
  "temp_offset_lower_bound": -5,
  "temp_offset_upper_bound": 5,
  "humidity_offset_lower_bound": -25,
  "humidity_offset_upper_bound": 25,
  "min_heat_setpoint": 45,
  "min_cool_setpoint": 45,
  "max_heat_setpoint": 99,
  "max_cool_setpoint": 99,
  "heat_setpoint_ceiling": "yes",
  "cool_setpoint_floor": "yes",
  "lowest_heat_setpoint_ceiling": 60,
  "highest_cool_setpoint_floor": 85,
  "scheduling": "yes",
  "max_steps_per_day": 8,
  "days_per_schedule": 7,
  "hold_modes": { "temporary": "yes", "permanent": "no", "curtailment": "no" },
  "circulating_fan": {
    "capable": "yes",
    "max_duty_cycle": 100,
    "min_duty_cycle": 10,
    "step": 5
  },
  "partial_keypad_lockout": {
    "setpoint": "yes",
    "system_mode": "yes",
    "fan_mode": "yes",
    "schedule_mode": "yes",
    "settings_menu": "yes"
  },
  "indoor_equipment": "electric",
  "outdoor_equipment": "heatpump",
  "indoor_stages": 2,
  "outdoor_stages": 2,
  "fan_stages": 0,
  "out_of_box_configuration": "yes",
  "reversing_valve_mode": "O",
  "operating_mode_settings": {
    "off": "yes",
    "heat": "yes",
    "cool": "yes",
    "aux": "yes",
    "auto": "yes"
  },
  "fan_mode_settings": { "auto": "yes", "on": "yes", "smart": "no" },
  "contractor_info": "no",
  "humidity_control": {
    "deadband": 10,
    "humidification": { "step": 5, "min": 5, "max": 50, "types": [] },
    "dehumidification": {
      "step": 5,
      "min": 40,
      "max": 95,
      "types": ["overcooling"]
    }
  },
  "open_adr": {
    "demand_response": "yes",
    "direct_load_controls": "no",
    "use_of_pricing": "yes"
  },
  "icd_id": "0a-50-30-62-eb-18-ff-ff"
}
```