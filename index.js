'use strict'

const prometheus_client = require('prom-client');
const register = prometheus_client.register;

exports.register = function () {
  const plugin = this;

  plugin.load_prometheus_json()
}

exports.hook_init_http = function (next, server) {
  const plugin = this;

  if(plugin.cfg.prometheus.enabled == true) {
    
    server.http.app.get('/metrics', async (req, res) => {
      try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
      } catch (ex) {
        res.status(500).end(ex);
      }
    });
    
    // server.get('/metrics/counter', async (req, res) => {
    //   try {
    //     res.set('Content-Type', register.contentType);
    //     res.end(await prometheus_client.getSingleMetricAsString('test_counter'));
    //   } catch (ex) {
    //     res.status(500).end(ex);
    //   }
    // });
          
    plugin.loginfo('prometheus init_http done, metrics exposed on /metrics endpoint');
  }
  next();
}

exports.load_prometheus_json = function () {
  const plugin = this

  plugin.cfg = plugin.config.get('prometheus.json', {
    booleans: [
      '+enabled'               // plugin.cfg.main.enabled=true
    ]
  },
    function () {
      plugin.load_prometheus_json()
    })
}