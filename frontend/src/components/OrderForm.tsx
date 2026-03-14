import React, { useState, useEffect, useRef } from 'react';
import type { Order, OrderFormData } from '../types';
import { COUNTRIES, PRODUCTS, ORDER_STATUSES, CREATED_BY } from '../utils/constants';

interface Props {
  order?: Order | null;
  onSubmit: (data: OrderFormData) => Promise<void>;
  onClose: () => void;
}

type FormErrors = Partial<Record<keyof OrderFormData, string>>;

const EMPTY_FORM: OrderFormData = {
  firstName: '', lastName: '', email: '', phone: '',
  streetAddress: '', city: '', state: '', postalCode: '',
  country: 'United States', product: 'Fiber Internet 300 Mbps',
  quantity: 1, unitPrice: 0, status: 'Pending',
  createdBy: 'Mr. Michael Harris',
};

export const OrderForm: React.FC<Props> = ({ order, onSubmit, onClose }) => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const formRef = useRef<OrderFormData>({ ...EMPTY_FORM });

  useEffect(() => {
    if (order) {
      const { id, orderId, orderDate, totalAmount: ta, createdAt, updatedAt, ...rest } = order;
      formRef.current = { ...rest } as OrderFormData;
      setTotalAmount(order.quantity * order.unitPrice);
    } else {
      formRef.current = { ...EMPTY_FORM };
      setTotalAmount(0);
    }
    setErrors({});
  }, [order]);

  const setField = (field: keyof OrderFormData, value: string | number) => {
    (formRef.current as any)[field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) : formRef.current.quantity;
      const p = field === 'unitPrice' ? Number(value) : formRef.current.unitPrice;
      setTotalAmount(q * p);
    }
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const f = formRef.current;
    const mandatory: (keyof OrderFormData)[] = [
      'firstName', 'lastName', 'email', 'phone', 'streetAddress',
      'city', 'state', 'postalCode', 'country', 'product',
      'quantity', 'unitPrice', 'status', 'createdBy',
    ];
    const newErrors: FormErrors = {};
    mandatory.forEach(field => {
      const v = (f as any)[field];
      if (v === '' || v === null || v === undefined) newErrors[field] = 'Please fill the field';
    });
    if (f.quantity < 1) newErrors.quantity = 'Quantity cannot be less than 1';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({ ...formRef.current });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const F = ({ label, field, type = 'text', placeholder, span = 1 }: {
    label: string; field: keyof OrderFormData; type?: string; placeholder?: string; span?: number;
  }) => (
    <div style={{ gridColumn: `span ${span}` }}>
      <label style={s.label}>{label}<span style={{ color: '#EF4444' }}> *</span></label>
      <input
        type={type}
        defaultValue={String((formRef.current as any)[field] ?? '')}
        onChange={e => setField(field, type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        style={{ ...s.input, ...(errors[field] ? s.err : {}) }}
      />
      {errors[field] && <p style={s.errMsg}>{errors[field]}</p>}
    </div>
  );

  const S = ({ label, field, options }: { label: string; field: keyof OrderFormData; options: string[] }) => (
    <div>
      <label style={s.label}>{label}<span style={{ color: '#EF4444' }}> *</span></label>
      <select
        defaultValue={String((formRef.current as any)[field])}
        onChange={e => setField(field, e.target.value)}
        style={{ ...s.input, ...(errors[field] ? s.err : {}) }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {errors[field] && <p style={s.errMsg}>{errors[field]}</p>}
    </div>
  );

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>

        {/* Header — fixed */}
        <div style={s.header}>
          <div>
            <h2 style={s.title}>{order ? 'Edit Order' : 'Create Order'}</h2>
            <p style={s.subtitle}>{order ? `Editing ${order.orderId}` : 'Fill in the details to create a new order'}</p>
          </div>
          <button onClick={onClose} style={s.close}>✕</button>
        </div>

        {/* Body — scrollable */}
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={s.body}>

            {/* Customer Info */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={s.secHead}>
                <div style={{ ...s.dot, background: '#10B981' }} />
                <h3 style={s.secTitle}>Customer Information</h3>
              </div>
              <div style={s.grid}>
                <F label="First name" field="firstName" />
                <F label="Last name" field="lastName" />
                <F label="Email ID" field="email" type="email" />
                <F label="Phone number" field="phone" />
                <F label="Street address" field="streetAddress" span={2} />
                <F label="City" field="city" />
                <F label="State / Province" field="state" />
                <F label="Postal code" field="postalCode" />
                <S label="Country" field="country" options={COUNTRIES} />
              </div>
            </div>

            {/* Order Info */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={s.secHead}>
                <div style={{ ...s.dot, background: '#8B5CF6' }} />
                <h3 style={s.secTitle}>Order Information</h3>
              </div>
              <div style={s.grid}>
                <S label="Choose product" field="product" options={PRODUCTS} />
                <S label="Status" field="status" options={ORDER_STATUSES} />

                <div>
                  <label style={s.label}>Quantity<span style={{ color: '#EF4444' }}> *</span></label>
                  <input type="number" min={1}
                    defaultValue={formRef.current.quantity}
                    onChange={e => setField('quantity', Math.max(1, Number(e.target.value)))}
                    style={{ ...s.input, ...(errors.quantity ? s.err : {}) }}
                  />
                  {errors.quantity && <p style={s.errMsg}>{errors.quantity}</p>}
                </div>

                <div>
                  <label style={s.label}>Unit price<span style={{ color: '#EF4444' }}> *</span></label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', fontSize: '14px' }}>$</span>
                    <input type="number" min={0} step={0.01}
                      defaultValue={formRef.current.unitPrice}
                      onChange={e => setField('unitPrice', Number(e.target.value))}
                      style={{ ...s.input, paddingLeft: '2rem', ...(errors.unitPrice ? s.err : {}) }}
                    />
                  </div>
                  {errors.unitPrice && <p style={s.errMsg}>{errors.unitPrice}</p>}
                </div>

                {/* Total — read only */}
                <div>
                  <label style={s.label}>Total amount<span style={{ color: '#EF4444' }}> *</span></label>
                  <div style={s.readOnly}>
                    <span style={{ fontSize: '13px', color: '#6B7280' }}>Auto-calculated</span>
                    <span style={{ fontWeight: 600, color: '#111827' }}>
                      ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <S label="Created by" field="createdBy" options={CREATED_BY} />
              </div>
            </div>
          </div>

          {/* Footer — always visible at bottom */}
          <div style={s.footer}>
            <button type="button" onClick={onClose} style={s.cancel}>Cancel</button>
            <button type="submit" disabled={submitting} style={s.submit}>
              {submitting ? 'Saving...' : order ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  overlay:  { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(2px)' },
  modal:    { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '760px', height: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' },
  header:   { padding: '1.25rem 2rem', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 },
  title:    { margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827' },
  subtitle: { margin: '4px 0 0', fontSize: '13px', color: '#6B7280' },
  close:    { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9CA3AF' },
  body:     { padding: '1.25rem 2rem', overflowY: 'auto', flex: 1 },
  footer:   { padding: '1rem 2rem', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexShrink: 0, background: '#fff', borderRadius: '0 0 16px 16px' },
  secHead:  { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' },
  dot:      { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  secTitle: { margin: 0, fontSize: '13px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' },
  grid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' },
  label:    { display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '5px' },
  input:    { width: '100%', padding: '0.5rem 0.75rem', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', color: '#111827', background: '#FAFAFA', outline: 'none', boxSizing: 'border-box' },
  err:      { borderColor: '#EF4444', background: '#FFF5F5' },
  errMsg:   { margin: '4px 0 0', fontSize: '12px', color: '#EF4444' },
  readOnly: { padding: '0.5rem 0.75rem', border: '1.5px solid #E5E7EB', borderRadius: '8px', background: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cancel:   { padding: '0.6rem 1.5rem', borderRadius: '8px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: '14px', fontWeight: 500, cursor: 'pointer' },
  submit:   { padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
};

