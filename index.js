'use strict'

exports.register = function () {
  this.load_prometheus_json()
}

exports.load_prometheus_json = function () {
  const plugin = this

  plugin.cfg = plugin.config.get('prometheus.json', {
    booleans: [
      '+enabled',               // plugin.cfg.main.enabled=true
      '-disabled',              // plugin.cfg.main.disabled=false
      '+feature_section.yes'    // plugin.cfg.feature_section.yes=true
    ]
  },
    function () {
      plugin.load_prometheus_json()
    })
}