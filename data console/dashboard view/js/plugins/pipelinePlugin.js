import { createKpiCard } from '../components/kpiCard.js';
import { createSpeedometer } from '../components/speedometer.js';

function sumEntityCounts(entityCounts = {}) {
  return Object.values(entityCounts).reduce((sum, count) => sum + Number(count || 0), 0);
}

function estimateRate(totalRecords, fileCount) {
  const ingestRate = Math.min(1000, totalRecords * 40);
  const validationRate = Math.min(1000, Math.round(ingestRate * 1.1));
  const writeRate = Math.min(1000, Math.max(100, fileCount * 120));
  return { ingestRate, validationRate, writeRate };
}

const CSV_HEADERS = [
  { file: 'customer_profiles.csv', headers: ['id', 'email', 'segment', 'region', 'signupDate'] },
  { file: 'customer_orders.csv', headers: ['orderId', 'customerId', 'orderDate', 'grossRevenue', 'discountAmount', 'netRevenue'] },
  { file: 'customer_returns.csv', headers: ['returnId', 'orderId', 'customerId', 'returnDate', 'refundAmount', 'reason'] },
  { file: 'customer_subscriptions.csv', headers: ['subscriptionId', 'customerId', 'planName', 'mrr', 'status', 'startDate', 'endDate'] },
  { file: 'customer_support_tickets.csv', headers: ['ticketId', 'customerId', 'openedDate', 'priority', 'resolutionHours', 'issueCategory'] }
];

function buildCsvHeadersMarkup() {
  return CSV_HEADERS.map((stream) => `
    <article class="csv-header-card">
      <div class="csv-file">${stream.file}</div>
      <div class="csv-cols">${stream.headers.join(', ')}</div>
    </article>
  `).join('');
}

function createLineGraph({ title, subtitle, className }) {
  const panel = document.createElement('article');
  panel.className = 'panel';
  panel.innerHTML = `
    <div class="title">${title}</div>
    <div class="legend">${subtitle}</div>
    <svg class="records-graph ${className || ''}" viewBox="0 0 640 220" role="img" aria-label="${title}">
      <g class="axis">
        <line x1="40" y1="20" x2="40" y2="190"></line>
        <line x1="40" y1="190" x2="620" y2="190"></line>
      </g>
      <polyline class="line" points="40,190 620,190"></polyline>
      <g class="dots"></g>
      <g class="labels"></g>
    </svg>
  `;

  const polyline = panel.querySelector('.line');
  const dots = panel.querySelector('.dots');
  const labels = panel.querySelector('.labels');

  function update(points = []) {
    dots.innerHTML = '';
    labels.innerHTML = '';

    if (!points.length) {
      polyline.setAttribute('points', '40,190 620,190');
      return;
    }

    const xStart = 70;
    const xEnd = 590;
    const yBottom = 180;
    const yTop = 35;
    const maxValue = Math.max(...points.map((point) => Number(point.value || 0)), 1);

    const polylinePoints = points.map((point, index) => {
      const x = xStart + (points.length === 1 ? 0 : (index * (xEnd - xStart)) / (points.length - 1));
      const y = yBottom - (Number(point.value || 0) / maxValue) * (yBottom - yTop);

      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', x);
      dot.setAttribute('cy', y);
      dot.setAttribute('r', '4');
      dot.setAttribute('class', 'dot');
      dots.append(dot);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x);
      label.setAttribute('y', 206);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('class', 'label');
      label.textContent = String(point.label || '').slice(0, 10);
      labels.append(label);

      return `${x},${y}`;
    });

    polyline.setAttribute('points', polylinePoints.join(' '));
  }

  return { panel, update };
}

export function pipelinePlugin(root) {
  const topbar = document.createElement('section');
  topbar.className = 'topbar';

  const titlePanel = document.createElement('article');
  titlePanel.className = 'panel';
  titlePanel.innerHTML = `
    <div class="headline">
      <h1>Data Console • SIEM Dashboard</h1>
    </div>
    <div class="legend">Horizontal monitoring with live ingestion-step animations.</div>
    <button class="run-btn" id="runIngestBtn">Run Ingest</button>
  `;

  const csvCard = createKpiCard({ title: 'Active CSV Streams', value: '0' });
  const objectCard = createKpiCard({ title: 'Objects in Lake', value: '0' });
  const healthCard = createKpiCard({ title: 'Pipeline Health', value: 'READY', tone: 'warn' });

  topbar.append(titlePanel, csvCard, objectCard, healthCard);

  const main = document.createElement('section');
  main.className = 'main-single';

  const processPanel = document.createElement('article');
  processPanel.className = 'panel process-panel';
  processPanel.innerHTML = `
    <div class="title">Ingestion process</div>
    <div class="legend">One container showing each pipeline step while ingestion runs.</div>
    <div class="process-steps" id="processSteps">
      <div class="step-box" data-step="extract">CSV Extract</div>
      <div class="step-box" data-step="parse">Parser</div>
      <div class="step-box" data-step="validate">Validation</div>
      <div class="step-box" data-step="transform">Transform</div>
      <div class="step-box" data-step="upsert">Objects Lake Upsert</div>
      <div class="step-box" data-step="summary">Summary Write</div>
    </div>
    <div class="csv-headers-wrap">
      <div class="title">CSV Headers</div>
      <div class="csv-headers-grid">${buildCsvHeadersMarkup()}</div>
    </div>
  `;

  const speedPanel = document.createElement('article');
  speedPanel.className = 'panel';
  speedPanel.innerHTML = `<div class="title">Data Fuel Speedometers</div><div class="legend">Track ingestion throughput and processing rates.</div>`;

  const ingestGauge = createSpeedometer({ label: 'Ingest Rate', value: 0, max: 1000, unit: ' r/m' });
  const validationGauge = createSpeedometer({ label: 'Validation Rate', value: 0, max: 1000, unit: ' r/m' });
  const writeGauge = createSpeedometer({ label: 'Lake Write Rate', value: 0, max: 1000, unit: ' r/m' });

  const gaugeGrid = document.createElement('div');
  gaugeGrid.className = 'gauge-grid';
  gaugeGrid.append(ingestGauge.element, validationGauge.element, writeGauge.element);
  speedPanel.append(gaugeGrid);

  const recordsGraph = createLineGraph({
    title: 'Records Processed',
    subtitle: 'Transparent trend graph by stream.',
    className: ''
  });

  const lakeObjectsPanel = document.createElement('article');
  lakeObjectsPanel.className = 'panel lake-panel';
  lakeObjectsPanel.innerHTML = `<div class="title">Lake Objects</div><div class="legend">Raw DLO volume and object distribution.</div>`;
  const lakeObjectsGauge = createSpeedometer({ label: 'Object Volume', value: 0, max: 1000, unit: ' obj' });
  lakeObjectsPanel.append(lakeObjectsGauge.element);
  const lakeObjectsGraph = createLineGraph({
    title: 'Lake Object Distribution',
    subtitle: 'Counts across DLO collections.',
    className: 'lake-objects-graph'
  });
  lakeObjectsPanel.append(lakeObjectsGraph.panel.querySelector('svg'));

  const lakeModelsPanel = document.createElement('article');
  lakeModelsPanel.className = 'panel lake-panel';
  lakeModelsPanel.innerHTML = `<div class="title">Lake Models</div><div class="legend">Model coverage and relationship readiness.</div>`;
  const lakeModelsGauge = createSpeedometer({ label: 'Model Coverage', value: 0, max: 100, unit: ' %' });
  lakeModelsPanel.append(lakeModelsGauge.element);
  const lakeModelsGraph = createLineGraph({
    title: 'Model Entity Coverage',
    subtitle: 'Customer model dimensions populated.',
    className: 'lake-models-graph'
  });
  lakeModelsPanel.append(lakeModelsGraph.panel.querySelector('svg'));

  main.append(processPanel, speedPanel, recordsGraph.panel, lakeObjectsPanel, lakeModelsPanel);
  root.append(topbar, main);

  const [csvValueNode] = csvCard.querySelectorAll('.value');
  const [objectValueNode] = objectCard.querySelectorAll('.value');
  const [healthValueNode] = healthCard.querySelectorAll('.value');
  const runButton = titlePanel.querySelector('#runIngestBtn');
  const stepNodes = processPanel.querySelectorAll('.step-box');

  function clearStepState() {
    stepNodes.forEach((node) => node.classList.remove('running', 'done'));
  }

  function playStepAnimation() {
    clearStepState();
    stepNodes.forEach((node, index) => {
      setTimeout(() => {
        node.classList.add('running');
      }, 200 + index * 300);
      setTimeout(() => {
        node.classList.remove('running');
        node.classList.add('done');
      }, 700 + index * 300);
    });
  }

  function setLakePanels(entityCounts = {}, modelObjectCounts = {}) {
    const dloEntries = Object.entries(entityCounts).map(([label, value]) => ({ label, value: Number(value || 0) }));
    const modelEntries = Object.entries(modelObjectCounts).map(([label, value]) => ({ label, value: Number(value || 0) }));

    const totalObjects = dloEntries.reduce((sum, item) => sum + item.value, 0);
    const nonEmptyModels = modelEntries.filter((item) => item.value > 0).length;
    const modelCoverage = modelEntries.length ? Math.round((nonEmptyModels / modelEntries.length) * 100) : 0;

    lakeObjectsGauge.setValue(Math.min(1000, totalObjects));
    lakeObjectsGraph.update(dloEntries.map((item) => ({ label: item.label.replace('_DLO', ''), value: item.value })));

    lakeModelsGauge.setValue(modelCoverage);
    lakeModelsGraph.update(modelEntries.map((item) => ({ label: item.label.replace('_DMO', ''), value: item.value })));
  }

  function resetMetrics() {
    csvValueNode.textContent = '0';
    objectValueNode.textContent = '0';
    healthValueNode.textContent = 'READY';
    ingestGauge.setValue(0);
    validationGauge.setValue(0);
    writeGauge.setValue(0);
    recordsGraph.update([]);
    setLakePanels({}, {});
    clearStepState();
  }

  async function runIngest() {
    runButton.disabled = true;
    runButton.textContent = 'Running...';
    healthValueNode.textContent = 'RUNNING';
    healthValueNode.className = 'value warn';

    playStepAnimation();

    try {
      const response = await fetch('/api/ingest', { method: 'POST' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      const summary = payload.summary || {};
      const fileCount = (summary.processedCsvFiles || []).length;
      const entityCounts = summary.entityCounts || {};
      const modelObjectCounts = summary.modelObjectCounts || {};
      const totalRecords = sumEntityCounts(entityCounts);
      const rates = estimateRate(totalRecords, fileCount);

      csvValueNode.textContent = String(fileCount);
      objectValueNode.textContent = String(totalRecords);
      healthValueNode.textContent = 'HEALTHY';
      healthValueNode.className = 'value ok';

      ingestGauge.setValue(rates.ingestRate);
      validationGauge.setValue(rates.validationRate);
      writeGauge.setValue(rates.writeRate);

      recordsGraph.update(
        Object.entries(entityCounts).map(([label, value]) => ({ label: label.replace('_DLO', ''), value: Number(value || 0) }))
      );
      setLakePanels(entityCounts, modelObjectCounts);
    } catch (error) {
      healthValueNode.textContent = 'FAILED';
      healthValueNode.className = 'value bad';
      clearStepState();
      console.error(error);
    } finally {
      runButton.disabled = false;
      runButton.textContent = 'Run Ingest';
    }
  }

  runButton.addEventListener('click', runIngest);
  resetMetrics();
}
