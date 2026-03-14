import React, { useState } from 'react';
import type { DashboardWidget, KPIConfig, ChartConfig, PieConfig, TableConfig } from '../types/dashboard';
import { AXIS_OPTIONS, METRIC_OPTIONS, NUMERIC_METRICS, TABLE_COLUMNS, PIE_OPTIONS } from '../types/dashboard';

interface Props {
  widget: DashboardWidget;
  onSave: (updated: DashboardWidget) => void;
  onClose: () => void;
}

export const WidgetConfigPanel: React.FC<Props> = ({ widget, onSave, onClose }) => {
  const [w, setW] = useState<DashboardWidget>({ ...widget, config: { ...widget.config } });

  const set = (field: string, value: any) => setW(prev => ({ ...prev, [field]: value }));
  const setCfg = (field: string, value: any) => setW(prev => ({ ...prev, config: { ...prev.config, [field]: value } }));
  const setLayout = (field: string, value: number) => setW(prev => ({ ...prev, layout: { ...prev.layout, [field]: Math.max(1, value) } }));

  const cfg = w.config as any;

  const Label = ({ text }: { text: string }) => (
    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{text}</label>
  );

  const Input = ({ value, onChange, type = 'text', min }: { value: any; onChange: (v: any) => void; type?: string; min?: number }) => (
    <input type={type} value={value} min={min} onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1.5px solid #E5E7EB', borderRadius: '7px', fontSize: '13px', boxSizing: 'border-box', background: '#FAFAFA' }} />
  );

  const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1.5px solid #E5E7EB', borderRadius: '7px', fontSize: '13px', background: '#FAFAFA', boxSizing: 'border-box' }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  const Row = ({ children }: { children: React.ReactNode }) => (
    <div style={{ marginBottom: '1rem' }}>{children}</div>
  );

  const Section = ({ title }: { title: string }) => (
    <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '1.25rem 0 0.75rem', paddingBottom: '6px', borderBottom: '1px solid #F3F4F6' }}>
      {title}
    </div>
  );

  const typeLabel: Record<string, string> = {
    kpi: 'KPI', bar: 'Bar Chart', line: 'Line Chart', area: 'Area Chart',
    scatter: 'Scatter Plot', pie: 'Pie Chart', table: 'Table',
  };

  return (
    <div style={{ width: '300px', background: '#fff', borderLeft: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>Configure Widget</h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9CA3AF' }}>{typeLabel[w.type]}</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>

        {/* Common */}
        <Row>
          <Label text="Widget title" />
          <Input value={w.title} onChange={v => set('title', v)} />
        </Row>
        <Row>
          <Label text="Widget type" />
          <input value={typeLabel[w.type]} readOnly style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1.5px solid #E5E7EB', borderRadius: '7px', fontSize: '13px', background: '#F3F4F6', color: '#6B7280', boxSizing: 'border-box' }} />
        </Row>
        <Row>
          <Label text="Description" />
          <textarea value={w.description} onChange={e => set('description', e.target.value)} rows={2}
            style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1.5px solid #E5E7EB', borderRadius: '7px', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box', background: '#FAFAFA' }} />
        </Row>

        {/* Size */}
        <Section title="Widget size" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <Label text="Width (cols)" />
            <Input type="number" value={w.layout.w} min={1} onChange={v => setLayout('w', v)} />
          </div>
          <div>
            <Label text="Height (rows)" />
            <Input type="number" value={w.layout.h} min={1} onChange={v => setLayout('h', v)} />
          </div>
        </div>

        {/* Data Settings */}
        <Section title="Data settings" />

        {/* KPI */}
        {w.type === 'kpi' && (
          <>
            <Row>
              <Label text="Select metric" />
              <Select value={cfg.metric || 'Total amount'} onChange={v => setCfg('metric', v)} options={METRIC_OPTIONS} />
            </Row>
            <Row>
              <Label text="Aggregation" />
              <Select
                value={cfg.aggregation || 'Sum'}
                onChange={v => setCfg('aggregation', v)}
                options={NUMERIC_METRICS.includes(cfg.metric) ? ['Sum', 'Average', 'Count'] : ['Count']}
              />
            </Row>
            <Row>
              <Label text="Data format" />
              <Select value={cfg.dataFormat || 'Number'} onChange={v => setCfg('dataFormat', v)} options={['Number', 'Currency']} />
            </Row>
            <Row>
              <Label text="Decimal precision" />
              <Input type="number" value={cfg.decimalPrecision ?? 0} min={0} onChange={v => setCfg('decimalPrecision', v)} />
            </Row>
          </>
        )}

        {/* Charts */}
        {['bar', 'line', 'area', 'scatter'].includes(w.type) && (
          <>
            <Row>
              <Label text="X-Axis" />
              <Select value={cfg.xAxis || 'Product'} onChange={v => setCfg('xAxis', v)} options={AXIS_OPTIONS} />
            </Row>
            <Row>
              <Label text="Y-Axis" />
              <Select value={cfg.yAxis || 'Total amount'} onChange={v => setCfg('yAxis', v)} options={AXIS_OPTIONS} />
            </Row>
            <Section title="Styling" />
            <Row>
              <Label text="Chart color" />
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={cfg.chartColor || '#10B981'} onChange={e => setCfg('chartColor', e.target.value)}
                  style={{ width: '40px', height: '36px', border: '1.5px solid #E5E7EB', borderRadius: '7px', cursor: 'pointer', padding: '2px' }} />
                <input type="text" value={cfg.chartColor || '#10B981'} onChange={e => setCfg('chartColor', e.target.value)}
                  style={{ flex: 1, padding: '0.45rem 0.65rem', border: '1.5px solid #E5E7EB', borderRadius: '7px', fontSize: '13px', background: '#FAFAFA' }} />
              </div>
            </Row>
            <Row>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                <input type="checkbox" checked={cfg.showDataLabel || false} onChange={e => setCfg('showDataLabel', e.target.checked)} />
                Show data labels
              </label>
            </Row>
          </>
        )}

        {/* Pie */}
        {w.type === 'pie' && (
          <>
            <Row>
              <Label text="Chart data" />
              <Select value={cfg.chartData || 'Status'} onChange={v => setCfg('chartData', v)} options={PIE_OPTIONS} />
            </Row>
            <Row>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                <input type="checkbox" checked={cfg.showLegend || false} onChange={e => setCfg('showLegend', e.target.checked)} />
                Show legend
              </label>
            </Row>
          </>
        )}

        {/* Table */}
        {w.type === 'table' && (
          <>
            <Row>
              <Label text="Choose columns" />
              <div style={{ border: '1.5px solid #E5E7EB', borderRadius: '7px', padding: '8px', maxHeight: '160px', overflowY: 'auto', background: '#FAFAFA' }}>
                {TABLE_COLUMNS.map(col => (
                  <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '3px 0', cursor: 'pointer' }}>
                    <input type="checkbox"
                      checked={(cfg.columns || []).includes(col)}
                      onChange={e => {
                        const cols = cfg.columns || [];
                        setCfg('columns', e.target.checked ? [...cols, col] : cols.filter((c: string) => c !== col));
                      }} />
                    {col}
                  </label>
                ))}
              </div>
            </Row>
            <Row>
              <Label text="Sort by" />
              <Select value={cfg.sortBy || 'Order date'} onChange={v => setCfg('sortBy', v)} options={['Ascending', 'Descending', 'Order date']} />
            </Row>
            <Row>
              <Label text="Pagination" />
              <Select value={String(cfg.pagination || 5)} onChange={v => setCfg('pagination', Number(v))} options={['5', '10', '15']} />
            </Row>
            <Section title="Styling" />
            <Row>
              <Label text="Font size" />
              <Input type="number" value={cfg.fontSize || 14} min={12} onChange={v => setCfg('fontSize', Math.min(18, Math.max(12, v)))} />
            </Row>
            <Row>
              <Label text="Header background" />
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={cfg.headerBackground || '#54bd95'} onChange={e => setCfg('headerBackground', e.target.value)}
                  style={{ width: '40px', height: '36px', border: '1.5px solid #E5E7EB', borderRadius: '7px', cursor: 'pointer', padding: '2px' }} />
                <input type="text" value={cfg.headerBackground || '#54bd95'} onChange={e => setCfg('headerBackground', e.target.value)}
                  style={{ flex: 1, padding: '0.45rem 0.65rem', border: '1.5px solid #E5E7EB', borderRadius: '7px', fontSize: '13px', background: '#FAFAFA' }} />
              </div>
            </Row>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #F3F4F6', display: 'flex', gap: '0.5rem' }}>
        <button onClick={onClose} style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', border: '1.5px solid #E5E7EB', background: '#fff', fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: '#374151' }}>
          Cancel
        </button>
        <button onClick={() => onSave(w)} style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          Apply
        </button>
      </div>
    </div>
  );
};
