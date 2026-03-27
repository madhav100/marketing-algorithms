export function createSpeedometer({ label, value, max, unit = '' }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const circumference = Math.PI * 70;
  const dashOffset = circumference * (1 - pct);

  const wrap = document.createElement('article');
  wrap.className = 'panel gauge-card';
  wrap.innerHTML = `
    <div class="gauge-label">${label}</div>
    <svg class="gauge" viewBox="0 0 200 120" role="img" aria-label="${label} speedometer">
      <path class="track" d="M 20 100 A 80 80 0 0 1 180 100" />
      <path class="fill" d="M 20 100 A 80 80 0 0 1 180 100" style="stroke-dasharray:${circumference};stroke-dashoffset:${dashOffset};"/>
    </svg>
    <div class="gauge-value">${value}${unit} / ${max}${unit}</div>
  `;
  return wrap;
}
