'use strict'

const prometheus_client = require('prom-client');

exports.register = function () {
  const plugin = this;

  plugin.load_prometheus_json();

  const hooks = [
    'connect_init',
    'deny',
    'queue_ok',
    'disconnect'
  ];

  for (const h in hooks) {
    plugin.register_hook(hooks[h], `prometheus_${hooks[h]}`);
  }
}

exports.hook_init_http = function (next, server) {
  const plugin = this;

  if(plugin.cfg.prometheus.enabled == true) {
    
    server.http.app.get('/metrics', async (req, res) => {
      try {
        res.set('Content-Type', prometheus_client.register.contentType);
        res.end(await prometheus_client.register.metrics());
      } catch (ex) {
        res.status(500).end(ex);
      }
    });
    
    // server.get('/metrics/counter', async (req, res) => {
    //   try {
    //     res.set('Content-Type', prometheus_client.register.contentType);
    //     res.end(await prometheus_client.getSingleMetricAsString('test_counter'));
    //   } catch (ex) {
    //     res.status(500).end(ex);
    //   }
    // });
          
    plugin.loginfo('prometheus init_http done, metrics exposed on /metrics endpoint');
  }
  next();
}

exports.prom_connect_init = function (next, connection, msg) {
  const plugin = this;

  plugin.logdebug(`prometheus connect_init saw: ${msg}`, connection);
  prometheus_client.Counter(plugin.prepare_metric_name('connect_init_total'), `Total connect_init hook calls.`, plugin.cfg.prometheus.label_names).inc(1);
  
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

  plugin.logdebug(`prometheus deny saw: ${pi_name} ${pi_code} deny from ${pi_hook}`, connection);
  prometheus_client.Counter(plugin.prepare_metric_name(`${pi_hook}_total`), `Total ${pi_hook} hook calls.`, plugin.cfg.prometheus.label_names).inc(1);
  prometheus_client.Counter(plugin.prepare_metric_name(`${pi_hook}_${pi_code}_total`), `Total ${pi_hook} hook calls with code ${pi_code}.`, plugin.cfg.prometheus.label_names).inc(1);

  next();
}

exports.prom_queue_ok = function (next, connection, msg) {
  const plugin = this;

  plugin.logdebug(`prometheus queue_ok saw: ${msg}`, connection);
  prometheus_client.Counter(plugin.prepare_metric_name('queue_ok_total'), `Total queue_ok hook calls.`, plugin.cfg.prometheus.label_names).inc(1);
  
  next();
}

exports.prom_disconnect = function (next, connection) {
  const plugin = this;

  plugin.logdebug(`prometheus disconnect saw: ${connection.transaction.uuid}`, connection);
  prometheus_client.Counter(plugin.prepare_metric_name('disconnect_total'), `Total disconnect hook calls.`, plugin.cfg.prometheus.label_names).inc(1);

  plugin.process_metrics_from_notes(connection);

  next();
}

//[{ type: 'counter', name 'foo', help: '', value: 1, label_names: ['foo', 'bar'] }]
exports.process_metrics_from_notes = function(connection) {
  const plugin = this;

  if(connection.notes.prometheus_metrics) {
    for (const m in connection.notes.prometheus_metrics) {
      const metric = connection.notes.prometheus_metrics[m];
      plugin.logdebug(`prometheus process_metrics_from_notes saw: name=${metric.name}, value=${metric.value}, help=${metric.help}, label_names=${metric.label_names}`, connection);
      switch (metric.type) {
        case 'counter':
          prometheus_client.Counter(plugin.prepare_metric_name(metric.name), metric.help, plugin.prepare_label_names(metric.label_names)).inc(metric.value);
          break;
        case 'gauge':
          prometheus_client.Gauge(plugin.prepare_metric_name(metric.name), metric.help, plugin.prepare_label_names(metric.label_names)).set(metric.value);
          break;
        case 'histogram':
          prometheus_client.Histogram(plugin.prepare_metric_name(metric.name), metric.help, plugin.prepare_label_names(metric.label_names)).observe(metric.value);
          break;
        case 'summary':
          prometheus_client.Summary(plugin.prepare_metric_name(metric.name), metric.help, plugin.prepare_label_names(metric.label_names)).observe(metric.value);
          break;
        default:
          plugin.logerror(`prometheus saw unknown metric type: ${metric.type}`, connection);
      }
    }
  }
}

exports.prepare_metric_name = function(metric_name) {
  return `${plugin.cfg.prometheus.prefix}_${metric_name}`;
}

exports.prepare_label_names = function(label_names) {
  if (plugin.cfg.prometheus.prefix && label_names) {
    return [...plugin.cfg.prometheus.label_names, ...label_names];
  }
  else if (plugin.cfg.prometheus.prefix) {
    return plugin.cfg.prometheus.label_names;
  }
  else if (label_names) {
    return label_names;
  }
  else {
    return [];
  }
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