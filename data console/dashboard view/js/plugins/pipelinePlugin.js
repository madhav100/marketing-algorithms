import { createKpiCard } from '../components/kpiCard.js';
import { createSpeedometer } from '../components/speedometer.js';
import { createTablePanel } from '../components/tablePanel.js';

export function pipelinePlugin(root) {
  const topbar = document.createElement('section');
  topbar.className = 'topbar';

  const titlePanel = document.createElement('article');
  titlePanel.className = 'panel';
  titlePanel.innerHTML = `
    <div class="headline">
      <h1>Data Console • Modular SIEM Dashboard</h1>
      <span class="tag">pluggable UI</span>
    </div>
    <div class="legend">Component-based horizontal dashboard where data is the fuel.</div>
  `;

  topbar.append(
    titlePanel,
    createKpiCard({ title: 'Active CSV Streams', value: '5' }),
    createKpiCard({ title: 'Objects in Lake', value: '19' }),
    createKpiCard({ title: 'Pipeline Health', value: 'HEALTHY', tone: 'ok' }),
    createKpiCard({ title: 'Governance Alerts', value: '0 BLOCKING', tone: 'warn' })
  );

  const main = document.createElement('section');
  main.className = 'main';

  const speedPanels = document.createElement('article');
  speedPanels.className = 'panel';
  speedPanels.innerHTML = `<div class="title">Data Fuel Speedometers</div><div class="legend">Track ingestion throughput and processing rates.</div>`;

  const gaugeGrid = document.createElement('div');
  gaugeGrid.className = 'gauge-grid';
  gaugeGrid.append(
    createSpeedometer({ label: 'Ingest Rate', value: 780, max: 1000, unit: ' r/m' }),
    createSpeedometer({ label: 'Validation Rate', value: 920, max: 1000, unit: ' r/m' }),
    createSpeedometer({ label: 'Lake Write Rate', value: 640, max: 1000, unit: ' r/m' })
  );
  speedPanels.append(gaugeGrid);

  const middleStack = document.createElement('section');
  middleStack.className = 'stack';
  middleStack.append(
    createTablePanel({
      title: 'Entity Relationships',
      headers: ['Entity', 'Key', 'Relationship'],
      rows: [
        ['customer_profiles', '<span class="mono">id</span>', 'root customer object'],
        ['customer_orders', '<span class="mono">orderId</span>', '<span class="mono">customerId → customer_profiles.id</span>'],
        ['customer_returns', '<span class="mono">returnId</span>', '<span class="mono">orderId + customerId</span>'],
        ['customer_subscriptions', '<span class="mono">subscriptionId</span>', '<span class="mono">customerId → customer_profiles.id</span>']
      ]
    }),
    createTablePanel({
      title: 'Governance Controls',
      headers: ['Control', 'Status'],
      rows: [
        ['Required IDs', '<span class="ok">PASS</span>'],
        ['Numeric Revenue Fields', '<span class="ok">PASS</span>'],
        ['Date Format', '<span class="ok">PASS</span>'],
        ['Revenue Integrity', '<span class="ok">PASS</span>']
      ]
    })
  );

  const eventPanel = createTablePanel({
    title: 'SOC-Style Event Feed',
    headers: ['Time', 'Event', 'Severity'],
    rows: [
      ['<span class="mono">05:41:19</span>', 'Watch trigger: customer_orders.csv updated', '<span class="warn">MED</span>'],
      ['<span class="mono">05:41:20</span>', 'Ingestion rebuild completed (5 files)', '<span class="ok">LOW</span>'],
      ['<span class="mono">05:41:20</span>', 'Governance checks passed', '<span class="ok">LOW</span>'],
      ['<span class="mono">05:41:21</span>', 'lake-summary.json refreshed', '<span class="ok">INFO</span>']
    ]
  });

  main.append(speedPanels, middleStack, eventPanel);

  root.append(topbar, main);
}
