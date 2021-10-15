# haraka-plugin-prometheus
A Haraka plugin for collecting metrics into Prometheus.

## Install

Install with npm
```bash
npm install @mailprotector/haraka-plugin-prometheus --save
```

## Setup
### HTTP Server

Enable Haraka's HTTP server (see `listen` in http.ini) to listen on [port 9904](https://github.com/prometheus/prometheus/wiki/Default-port-allocations)

http.ini:
```ini
listen=[::]:9904
```

### Enable Plugin
Add to `plugin` file in the haraka config folder
```text
@mailprotector/haraka-plugin-prometheus
```

### Config

Config options are set in `prometheus.json`:

| Parameter      | Description                              | Type    | Default Value |
| -------------- | ---------------------------------------- | ------- | ------------- |
| enabled        | whether to enable the plugin             | boolean | true          |
| prefix         | prefix that gets appended to all metrics | string  | none          |
| default_labels | labels to add to all metrics             | map     | none          |

## Sending metrics from other plugins

You can push metrics into the `connection.notes.prometheus_metrics` array from any other Haraka plugin. They will be collected into Prometheus on the `disconnect` hook.

The format of the array is:

```javascript
connection.notes.prometheus_metrics = [
  { type: 'counter', name 'test_counter', help: '', value: 1, label_names: ['foo', 'bar'] },
  { type: 'gauge', name 'test_gauge', help: '', value: 1, label_names: ['foo', 'bar'] },
  { type: 'histogram', name 'test_histogram', help: '', value: 1, label_names: ['foo', 'bar'] },
  { type: 'summary', name 'test_summary', help: '', value: 1, label_names: ['foo', 'bar'] }
]
```

##

![alt text](https://i1.wp.com/mailprotector.com/wp-content/uploads/2020/03/cropped-logo-2x.png)

[About Mailprotector](https://mailprotector.com/about-mailprotector)