import { createKpiCard } from '../components/kpiCard.js';
import { createSpeedometer } from '../components/speedometer.js';
import {
  renderBarChart,
  renderLineChart,
  renderDonutChart,
  renderHeatmap
} from '../charts/dmoCharts.js';

function sumEntityCounts(entityCounts = {}) {
  return Object.values(entityCounts).reduce((sum, count) => sum + Number(count || 0), 0);
}

function estimateRate(totalRecords, fileCount) {
  const ingestRate = Math.min(1000, totalRecords * 40);
  const validationRate = Math.min(1000, Math.round(ingestRate * 1.1));
  const writeRate = Math.min(1000, Math.max(100, fileCount * 120));
  return { ingestRate, validationRate, writeRate };
}

function chartPanel(title, subtitle, className = '') {
  const panel = document.createElement('article');
  panel.className = `panel ${className}`.trim();
  panel.innerHTML = `<div class="title">${title}</div><div class="legend">${subtitle}</div><div class="chart-body"></div>`;
  return panel;
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
    <div class="legend">Live DMO analytics charts and pipeline runtime states.</div>
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
    <div class="title">Pipeline Runtime Animation</div>
    <div class="legend">[ Ingestion Files ] → [ Data Streams ] → [ DLO ] → [ DMO ]</div>
    <div class="pipeline-runtime" id="pipelineRuntime">
      <div class="pipeline-node" data-node="files">Ingestion Files</div>
      <div class="pipeline-node" data-node="streams">Data Streams</div>
      <div class="pipeline-node" data-node="dlo">DLO</div>
      <div class="pipeline-node" data-node="dmo">DMO</div>
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

  const netRevenuePanel = chartPanel('Net Revenue by Segment', 'Bar chart');
  const refundRatePanel = chartPanel('Refund Amount / Refund Rate by Segment', 'Bar chart');
  const refundsOverTimePanel = chartPanel('Refunds Over Time', 'Line chart');
  const customerMixPanel = chartPanel('Customer Mix by Segment', 'Donut chart');
  const heatmapPanel = chartPanel('Segment × Metric View', 'Heatmap');

  main.append(
    processPanel,
    speedPanel,
    netRevenuePanel,
    refundRatePanel,
    refundsOverTimePanel,
    customerMixPanel,
    heatmapPanel
  );
  root.append(topbar, main);

  const [csvValueNode] = csvCard.querySelectorAll('.value');
  const [objectValueNode] = objectCard.querySelectorAll('.value');
  const [healthValueNode] = healthCard.querySelectorAll('.value');
  const runButton = titlePanel.querySelector('#runIngestBtn');
  const runtimeNode = processPanel.querySelector('#pipelineRuntime');
  const pipelineNodes = Array.from(processPanel.querySelectorAll('.pipeline-node'));

  function clearPipelineNodeStates() {
    pipelineNodes.forEach((node) => node.classList.remove('active', 'done', 'failed'));
  }

  function playPipelineSquares() {
    clearPipelineNodeStates();
    pipelineNodes.forEach((node, index) => {
      setTimeout(() => {
        node.classList.add('active');
      }, index * 320);
      setTimeout(() => {
        node.classList.remove('active');
        node.classList.add('done');
      }, index * 320 + 280);
    });
  }

  function setPipelineState(state) {
    runtimeNode.classList.remove('is-running', 'is-finished', 'is-failed');
    if (state) {
      runtimeNode.classList.add(state);
    }

    if (state === 'is-running') {
      playPipelineSquares();
    }

    if (state === 'is-failed') {
      clearPipelineNodeStates();
      pipelineNodes.forEach((node) => node.classList.add('failed'));
    }
  }

  function renderAnalyticsCharts(analytics) {
    const charts = analytics?.charts || {};

    renderBarChart(
      netRevenuePanel.querySelector('.chart-body'),
      (charts.netRevenueBySegment || []).map((item) => ({ label: item.segment, value: item.value })),
      { decimals: 2 }
    );

    renderBarChart(
      refundRatePanel.querySelector('.chart-body'),
      (charts.refundBySegment || []).map((item) => ({ label: item.segment, value: item.refundAmount })),
      { decimals: 2 }
    );

    renderLineChart(
      refundsOverTimePanel.querySelector('.chart-body'),
      (charts.refundsOverTime || []).map((item) => ({ label: item.month, value: item.refundAmount }))
    );

    renderDonutChart(
      customerMixPanel.querySelector('.chart-body'),
      (charts.customerMixBySegment || []).map((item) => ({ label: item.segment, value: item.customers }))
    );

    renderHeatmap(heatmapPanel.querySelector('.chart-body'), charts.heatmap || []);
  }

  function resetMetrics() {
    csvValueNode.textContent = '0';
    objectValueNode.textContent = '0';
    healthValueNode.textContent = 'READY';
    ingestGauge.setValue(0);
    validationGauge.setValue(0);
    writeGauge.setValue(0);
    setPipelineState('');
    renderAnalyticsCharts({ charts: {} });
  }

  async function runIngest() {
    runButton.disabled = true;
    runButton.textContent = 'Running...';
    healthValueNode.textContent = 'RUNNING';
    healthValueNode.className = 'value warn';
    setPipelineState('is-running');

    try {
      const response = await fetch('/api/ingest', { method: 'POST' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      const summary = payload.summary || {};
      const analytics = payload.analytics || {};
      const fileCount = (summary.processedCsvFiles || []).length;
      const entityCounts = summary.entityCounts || {};
      const totalRecords = sumEntityCounts(entityCounts);
      const rates = estimateRate(totalRecords, fileCount);

      csvValueNode.textContent = String(fileCount);
      objectValueNode.textContent = String(totalRecords);
      healthValueNode.textContent = 'HEALTHY';
      healthValueNode.className = 'value ok';

      ingestGauge.setValue(rates.ingestRate);
      validationGauge.setValue(rates.validationRate);
      writeGauge.setValue(rates.writeRate);

      renderAnalyticsCharts(analytics);
      setPipelineState('is-finished');
    } catch (error) {
      healthValueNode.textContent = 'FAILED';
      healthValueNode.className = 'value bad';
      setPipelineState('is-failed');
      console.error(error);
    } finally {
      runButton.disabled = false;
      runButton.textContent = 'Run Ingest';
    }
  }

  runButton.addEventListener('click', runIngest);
  resetMetrics();
}
