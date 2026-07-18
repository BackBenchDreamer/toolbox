'use client';

/**
 * LoanChart — zero-dependency SVG chart for loan amortisation data.
 *
 * Renders two series on a shared Y axis:
 *   • Outstanding balance  (accent blue, falling)
 *   • Cumulative interest  (error red, rising)
 *
 * Designed to work with the LoanChartData shape produced by calculateLoan().
 * All colours reference CSS custom properties so dark mode works automatically.
 */

import type { LoanChartData } from '@toolbox/finance';

interface Props {
  data: LoanChartData;
  height?: number;
}

const PAD = { top: 20, right: 16, bottom: 40, left: 68 };

export function LoanChart({ data, height = 240 }: Props) {
  const { months, balance, interestPaid } = data;
  if (!months.length) return null;

  const W = 640; // viewBox width — scales to container
  const H = height;
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const maxY = Math.max(...balance, ...interestPaid);
  const minY = 0;

  function scaleX(i: number) {
    return PAD.left + (i / (months.length - 1)) * plotW;
  }

  function scaleY(v: number) {
    return PAD.top + plotH - ((v - minY) / (maxY - minY)) * plotH;
  }

  function toPath(values: number[]) {
    return values
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(1)},${scaleY(v).toFixed(1)}`)
      .join(' ');
  }

  // Compute x-axis tick positions (max ~6 labels)
  const tickCount = Math.min(6, months.length);
  const tickIndices: number[] = [];
  for (let t = 0; t < tickCount; t++) {
    tickIndices.push(Math.round((t / (tickCount - 1)) * (months.length - 1)));
  }

  // Compute y-axis tick positions (5 levels)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => minY + f * (maxY - minY));

  function fmtK(v: number): string {
    if (v >= 1_00_00_000) return `${(v / 1_00_00_000).toFixed(0)}Cr`;
    if (v >= 1_00_000) return `${(v / 1_00_000).toFixed(0)}L`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return v.toFixed(0);
  }

  return (
    <figure style={{ margin: '1.5rem 0 0', padding: 0 }}>
      <figcaption style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
        Balance &amp; Cumulative Interest over Loan Tenure
      </figcaption>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <svg width="18" height="3" aria-hidden="true"><line x1="0" y1="1.5" x2="18" y2="1.5" stroke="var(--accent)" strokeWidth="2.5" /></svg>
          Balance
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <svg width="18" height="3" aria-hidden="true"><line x1="0" y1="1.5" x2="18" y2="1.5" stroke="var(--error)" strokeWidth="2.5" strokeDasharray="4 2" /></svg>
          Cum. Interest
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        aria-label="Loan amortisation chart"
        role="img"
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <line
            key={i}
            x1={PAD.left} y1={scaleY(tick).toFixed(1)}
            x2={PAD.left + plotW} y2={scaleY(tick).toFixed(1)}
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))}

        {/* Y axis labels */}
        {yTicks.map((tick, i) => (
          <text
            key={i}
            x={PAD.left - 6}
            y={Number(scaleY(tick).toFixed(1)) + 4}
            textAnchor="end"
            fontSize="11"
            fill="var(--muted)"
          >
            {fmtK(tick)}
          </text>
        ))}

        {/* X axis labels */}
        {tickIndices.map((idx) => (
          <text
            key={idx}
            x={scaleX(idx).toFixed(1)}
            y={H - PAD.bottom + 18}
            textAnchor="middle"
            fontSize="11"
            fill="var(--muted)"
          >
            {months[idx]}
          </text>
        ))}

        {/* X axis label */}
        <text x={PAD.left + plotW / 2} y={H - 2} textAnchor="middle" fontSize="10" fill="var(--muted)">
          Month
        </text>

        {/* Balance line */}
        <path d={toPath(balance)} fill="none" stroke="var(--accent)" strokeWidth="2" />

        {/* Cumulative interest line */}
        <path d={toPath(interestPaid)} fill="none" stroke="var(--error)" strokeWidth="2" strokeDasharray="5 3" />
      </svg>
    </figure>
  );
}
