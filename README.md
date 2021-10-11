# haraka-plugin-prometheus
A Haraka plugin for collecting metrics into Prometheus.

## Enable Prometheus Plugin

1. Enable Haraka's HTTP server (see `listen` in http.ini) to listen on prometheus port (default: 9090)
2. Add 'prometheus' to config/plugins
3. Configure the plugin (see below)

## Config

Config options are set in prometheus.json.

* enabled: boolean, default true, whether to enable the plugin
