import React, { useState, useCallback, useRef } from 'react';
import type { DashboardWidget, WidgetType } from '../types/dashboard';
import { WIDGET_DEFAULTS } from '../types/dashboard';
import { WidgetRenderer } from './WidgetRenderer';
import { WidgetConfigPanel } from './WidgetConfigPanel';
import { useOrders } from '../hooks/useOrders';
import { DATE_RANGE_OPTIONS } from '../utils/constants';

const WIDGET_LIST: { type: WidgetType; icon: string; label: string; group: string }[] = [
  { type: 'bar',     icon: '▤', label: 'Bar Chart',    group: 'Charts' },
  { type: 'line',    icon: '⤴', label: 'Line Chart',   group: 'Charts' },
  { type: 'pie',     icon: '◔', label: 'Pie Chart',    group: 'Charts' },
  { type: 'area',    icon: '▱', label: 'Area Chart',   group: 'Charts' },
  { type: 'scatter', icon: '⦿', label: 'Scatter Plot', group: 'Charts' },
  { type: 'table',   icon: '☰', label: 'Table',        group: 'Tables' },
  { type: 'kpi',     icon: '◎', label: 'KPI Value',    group: 'KPIs'   },
];

const DEFAULT_CONFIGS: Record<WidgetType, any> = {
  kpi:     { metric: 'Total amount', aggregation: 'Sum', dataFormat: 'Currency', decimalPrecision: 2 },
  bar:     { xAxis: 'Product', yAxis: 'Total amount', chartColor: '#10B981', showDataLabel: false },
  line:    { xAxis: 'Product', yAxis: 'Total amount', chartColor: '#3B82F6', showDataLabel: false },
  area:    { xAxis: 'Product', yAxis: 'Total amount', chartColor: '#8B5CF6', showDataLabel: false },
  scatter: { xAxis: 'Product', yAxis: 'Quantity',     chartColor: '#F59E0B', showDataLabel: false },
  pie:     { chartData: 'Status', showLegend: true },
  table:   { columns: ['Customer name', 'Product', 'Total amount', 'Status'], sortBy: 'Order date', pagination: 5, fontSize: 14, headerBackground: '#54bd95' },
};

let idCounter = 1;

const WIDGET_HEIGHTS: Record<WidgetType, number> = {
  kpi: 160, bar: 320, line: 320, area: 320,
  scatter: 320, pie: 300, table: 280,
};

export const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('all');
  const { orders } = useOrders(dateRange);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [configWidget, setConfigWidget] = useState<DashboardWidget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);

  const addWidget = useCallback((type: WidgetType) => {
    const id = `widget-${idCounter++}`;
    const newWidget: DashboardWidget = {
      id, type,
      title: 'Untitled',
      description: '',
      layout: { i: id, x: 0, y: 0, w: WIDGET_DEFAULTS[type].w, h: WIDGET_DEFAULTS[type].h },
      config: { ...DEFAULT_CONFIGS[type] },
    };
    setWidgets(prev => [...prev, newWidget]);
    setSaved(false);
  }, []);

  const handleDragStart = (id: string) => { dragId.current = id; };

  const handleDrop = (targetId: string) => {
    if (!dragId.current || dragId.current === targetId) return;
    setWidgets(prev => {
      const from = prev.findIndex(w => w.id === dragId.current);
      const to = prev.findIndex(w => w.id === targetId);
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
    dragId.current = null;
    setDragOverId(null);
  };

  const handleSaveConfig = (updated: DashboardWidget) => {
    setWidgets(prev => prev.map(w => w.id === updated.id ? updated : w));
    setConfigWidget(null);
    setSaved(false);
  };

  const handleDelete = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    setDeleteTarget(null);
    setSaved(false);
  };

  const groups = ['Charts', 'Tables', 'KPIs'];

  // Responsive columns
  const screenW = window.innerWidth;
  const cols = screenW >= 1200 ? 3 : screenW >= 768 ? 2 : 1;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F9FAFB', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Left Widget Panel */}
      <div style={{ width: '200px', background: '#fff', borderRight: '1px solid #E5E7EB', overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #F3F4F6' }}>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Widgets</p>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#9CA3AF' }}>Click to add</p>
        </div>
        {groups.map(group => (
          <div key={group}>
            <div style={{ padding: '8px 1rem 4px', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{group}</div>
            {WIDGET_LIST.filter(w => w.group === group).map(item => (
              <div key={item.type} onClick={() => addWidget(item.type)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 1rem', cursor: 'pointer', fontSize: '13px', color: '#374151' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F0FDF4')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span style={{ fontSize: '14px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top Bar */}
        <div style={{ padding: '0.875rem 1.5rem', background: '#fff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>Dashboard Configuration</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>Show data for</span>
              <select value={dateRange} onChange={e => setDateRange(e.target.value)}
                style={{ padding: '0.4rem 0.75rem', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', background: '#fff', cursor: 'pointer' }}>
                {DATE_RANGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}
            style={{ padding: '0.55rem 1.25rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            💾 Save Configuration
          </button>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {widgets.length === 0 ? (
            <div style={{ height: '400px', border: '2px dashed #D1D5DB', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: '#fff' }}>
              <span style={{ fontSize: '48px', opacity: 0.3 }}>◈</span>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#374151' }}>Canvas is empty</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>Click widgets from the left panel to add them</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1rem' }}>
              {widgets.map(widget => (
                <div
                  key={widget.id}
                  draggable
                  onDragStart={() => handleDragStart(widget.id)}
                  onDragOver={e => { e.preventDefault(); setDragOverId(widget.id); }}
                  onDragLeave={() => setDragOverId(null)}
                  onDrop={() => handleDrop(widget.id)}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    border: dragOverId === widget.id ? '2px dashed #10B981' : '1px solid #E5E7EB',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: `${WIDGET_HEIGHTS[widget.type]}px`,
                    opacity: dragId.current === widget.id ? 0.5 : 1,
                    gridColumn: widget.type === 'kpi' ? 'span 1' : 'span 1',
                  }}
                >
                  {/* Widget Header */}
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'grab', background: '#FAFAFA', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>⠿</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{widget.title}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => setConfigWidget(widget)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px 6px', color: '#6B7280' }} title="Settings">⚙️</button>
                      <button onClick={() => setDeleteTarget(widget.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px 6px', color: '#EF4444' }} title="Delete">🗑️</button>
                    </div>
                  </div>
                  {/* Widget Content */}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <WidgetRenderer widget={widget} orders={orders} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Config Panel */}
      {configWidget && (
        <WidgetConfigPanel widget={configWidget} onSave={handleSaveConfig} onClose={() => setConfigWidget(null)} />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '380px', width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '1rem' }}>🗑️</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700 }}>Delete Widget?</h3>
            <p style={{ margin: '0 0 1.5rem', color: '#6B7280', fontSize: '14px' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteTarget)} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#EF4444', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Save Toast */}
      {saved && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', background: '#10B981', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '10px', fontSize: '14px', fontWeight: 500, zIndex: 9999 }}>
          ✓ Dashboard saved!
        </div>
      )}
    </div>
  );
};