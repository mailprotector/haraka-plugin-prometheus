'use strict'

const prometheus_client = require('prom-client');

exports.register = function () {
  const plugin = this;

  plugin.load_prometheus_json();

  if (plugin.cfg.prometheus.enabled == true) {
    if (plugin.cfg.prometheus.default_labels) {
      prometheus_client.register.setDefaultLabels(plugin.cfg.prometheus.default_labels);
    }

    if (plugin.cfg.prometheus.prefix) {
      const prefix = `${plugin.cfg.prometheus.prefix}_`;
      prometheus_client.collectDefaultMetrics({ prefix });
    }

    const hooks = [
      'connect_init',
      'lookup_rdns',
      'connect',
      'capabilities',
      'unrecognized_command',
      'helo',
      'ehlo',
      'quit',
      'vrfy',
      'noop',
      'rset',
      'mail',
      'rcpt',
      'rcpt_ok',
      'data_post',
      'max_data_exceeded',
      'queue',
      'queue_outbound',
      'queue_ok',
      'reset_transaction',
      'deny',
      'get_mx',
      'deferred',
      'bounce',
      'delivered',
      'send_email',
      'disconnect'
    ];

    for (const h in hooks) {
      plugin.register_hook(hooks[h], 'prom_hook');
    }

    plugin.register_hook('disconnect', 'prom_disconnect');
  }

}

exports.hook_init_http = function (next, server) {
  const plugin = this;

  if (plugin.cfg.prometheus.enabled == true) {

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

exports.prom_hook = function (next, connection) {
  const plugin = this;

  plugin.logdebug(`prometheus ${connection.hook} started`, connection);
  new prometheus_client.Counter({
    name: plugin.prepare_metric_name(`${connection.hook}_total`),
    help: `Total ${connection.hook} hook calls.`
  }).inc(1);

  next();
}

exports.prom_disconnect = function (next, connection) {
  const plugin = this;

  plugin.process_metrics_from_notes(connection);

  next();
}

// connection.notes.prometheus_metrics = [{ type: 'counter', name 'foo', help: '', value: 1, label_names: ['foo', 'bar'] }]
exports.process_metrics_from_notes = function (connection) {
  const plugin = this;

  if (connection.notes.prometheus_metrics) {
    for (const m in connection.notes.prometheus_metrics) {
      const metric = connection.notes.prometheus_metrics[m];
      plugin.logdebug(`prometheus process_metrics_from_notes saw: name=${metric.name}, value=${metric.value}, help=${metric.help}, label_names=${metric.label_names}`, connection);
      switch (metric.type) {
        case 'counter':
          new prometheus_client.Counter({
            name: plugin.prepare_metric_name(metric.name),
            help: metric.help,
            labelNames: (metric.label_names ? metric.label_names : [])
          }).inc(metric.value);
          break;
        case 'gauge':
          new prometheus_client.Gauge({
            name: plugin.prepare_metric_name(metric.name),
            help: metric.help,
            labelNames: (metric.label_names ? metric.label_names : [])
          }).set(metric.value);
          break;
        case 'histogram':
          new prometheus_client.Histogram({
            name: plugin.prepare_metric_name(metric.name),
            help: metric.help,
            labelNames: (metric.label_names ? metric.label_names : [])
          }).observe(metric.value);
          break;
        case 'summary':
          new prometheus_client.Summary({
            name: plugin.prepare_metric_name(metric.name),
            help: metric.help,
            labelNames: (metric.label_names ? metric.label_names : [])
          }).observe(metric.value);
          break;
        default:
          plugin.logerror(`prometheus saw unknown metric type: ${metric.type}`, connection);
      }
    }
  }
}

exports.prepare_metric_name = function (metric_name) {
  const plugin = this;

  if (plugin.cfg.prometheus.prefix) {
    return `${plugin.cfg.prometheus.prefix}_${metric_name}`;
  }
  else {
    return metric_name;
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