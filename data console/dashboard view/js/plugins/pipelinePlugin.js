import { createKpiCard } from '../components/kpiCard.js';
import { createSpeedometer } from '../components/speedometer.js';
import { createTablePanel } from '../components/tablePanel.js';

function sumEntityCounts(entityCounts = {}) {
  return Object.values(entityCounts).reduce((sum, count) => sum + Number(count || 0), 0);
}

function estimateRate(totalRecords, fileCount) {
  const ingestRate = Math.min(1000, totalRecords * 40);
  const validationRate = Math.min(1000, Math.round(ingestRate * 1.1));
  const writeRate = Math.min(1000, Math.max(100, fileCount * 120));
  return { ingestRate, validationRate, writeRate };
}

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
    <button class="run-btn" id="runIngestBtn">Run Ingest</button>
  `;

  const csvCard = createKpiCard({ title: 'Active CSV Streams', value: '0' });
  const objectCard = createKpiCard({ title: 'Objects in Lake', value: '0' });
  const healthCard = createKpiCard({ title: 'Pipeline Health', value: 'READY', tone: 'warn' });
  const govCard = createKpiCard({ title: 'Governance Alerts', value: '0 BLOCKING', tone: 'ok' });

  topbar.append(titlePanel, csvCard, objectCard, healthCard, govCard);

  const main = document.createElement('section');
  main.className = 'main';

  const speedPanels = document.createElement('article');
  speedPanels.className = 'panel';
  speedPanels.innerHTML = `<div class="title">Data Fuel Speedometers</div><div class="legend">Track ingestion throughput and processing rates.</div>`;

  const ingestGauge = createSpeedometer({ label: 'Ingest Rate', value: 0, max: 1000, unit: ' r/m' });
  const validationGauge = createSpeedometer({ label: 'Validation Rate', value: 0, max: 1000, unit: ' r/m' });
  const writeGauge = createSpeedometer({ label: 'Lake Write Rate', value: 0, max: 1000, unit: ' r/m' });

  const gaugeGrid = document.createElement('div');
  gaugeGrid.className = 'gauge-grid';
  gaugeGrid.append(ingestGauge.element, validationGauge.element, writeGauge.element);
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
    rows: [["<span class='mono'>--:--:--</span>", 'Press "Run Ingest" to refresh data', '<span class="warn">INFO</span>']]
  });

  main.append(speedPanels, middleStack, eventPanel);
  root.append(topbar, main);

  const [csvValueNode] = csvCard.querySelectorAll('.value');
  const [objectValueNode] = objectCard.querySelectorAll('.value');
  const [healthValueNode] = healthCard.querySelectorAll('.value');
  const runButton = titlePanel.querySelector('#runIngestBtn');

  function resetMetrics() {
    csvValueNode.textContent = '0';
    objectValueNode.textContent = '0';
    healthValueNode.textContent = 'READY';
    ingestGauge.setValue(0);
    validationGauge.setValue(0);
    writeGauge.setValue(0);
  }

  async function runIngest() {
    runButton.disabled = true;
    runButton.textContent = 'Running...';
    healthValueNode.textContent = 'RUNNING';
    healthValueNode.className = 'value warn';

    try {
      const response = await fetch('/api/ingest', { method: 'POST' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      const summary = payload.summary || {};
      const fileCount = (summary.processedCsvFiles || []).length;
      const totalRecords = sumEntityCounts(summary.entityCounts || {});
      const rates = estimateRate(totalRecords, fileCount);

      csvValueNode.textContent = String(fileCount);
      objectValueNode.textContent = String(totalRecords);
      healthValueNode.textContent = 'HEALTHY';
      healthValueNode.className = 'value ok';

      ingestGauge.setValue(rates.ingestRate);
      validationGauge.setValue(rates.validationRate);
      writeGauge.setValue(rates.writeRate);
    } catch (error) {
      healthValueNode.textContent = 'FAILED';
      healthValueNode.className = 'value bad';
      console.error(error);
    } finally {
      runButton.disabled = false;
      runButton.textContent = 'Run Ingest';
    }
  }

  runButton.addEventListener('click', runIngest);
  resetMetrics();
}
