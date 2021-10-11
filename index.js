'use strict'

const prometheus_client = require('prom-client');
const register = prometheus_client.register;

exports.register = function () {
  const plugin = this;

  plugin.load_prometheus_json();

  plugin.register_hook('deny', 'prom_deny');
  plugin.register_hook('queue_ok', 'prom_queue_ok');
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

exports.prom_deny = function (next, connection, params) {
  const plugin = this;
  const pi_code = params[0];
  // let pi_msg    = params[1];
  const pi_name = params[2];
  // let pi_function = params[3];
  // let pi_params   = params[4];
  const pi_hook = params[5];

  connection.logdebug(this, `prometheus deny saw: ${pi_name} ${pi_code} deny from ${pi_hook}`);

  // TODO: Look for metrics on the connection.notes.prometheus_metrics object ie. [{type: 'counter', name 'foo', value: 1}]

  next();
}

exports.prom_queue_ok = function (next, connection, msg) {
  const plugin = this;

  connection.logdebug(this, `prometheus queue_ok saw: ${msg}`);

  // TODO: Look for metrics on the connection.notes.prometheus_metrics object ie. [{type: 'counter', name 'foo', value: 1}]

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