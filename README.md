# haraka-plugin-prometheus
A Haraka plugin for collecting metrics into Prometheus.

## Enable Prometheus Plugin

1. Enable Haraka's HTTP server (see `listen` in http.ini) to listen on [prometheus port 9904](https://github.com/prometheus/prometheus/wiki/Default-port-allocations)
2. Add 'prometheus' to config/plugins
3. Configure the plugin (see below)

http.ini:
```ini
listen=[::]:9904
```

## Config

Config options are set in prometheus.json.

* enabled: boolean, default true, whether to enable the plugin


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