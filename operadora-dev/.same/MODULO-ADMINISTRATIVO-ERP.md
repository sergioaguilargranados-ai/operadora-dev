# 🏢 MÓDULO ADMINISTRATIVO/ERP - AS OPERADORA

## 🎯 OBJETIVO

Sistema administrativo completo para AS Operadora que gestione:
- Facturación electrónica
- Cuentas por Cobrar (CxC)
- Cuentas por Pagar (CxP)
- CRM Corporativo
- Reportes financieros
- Control de inventario (servicios)
- Comisiones y pagos a agencias
- Gestión de proveedores

---

# 1️⃣ CRM CORPORATIVO (AS OPERADORA)

## Gestión de Clientes (Todos los Tipos)

### **Dashboard CRM:**
- Vista 360° de cada cliente
- Historial completo de interacciones
- Valor de vida del cliente (LTV)
- Segmentación automática
- Pipeline de ventas

### **Funcionalidades:**

**A) Gestión de Leads:**
- Captura de leads (formularios web, importación)
- Asignación automática a agentes
- Scoring de leads
- Seguimiento de conversiones

**B) Gestión de Clientes:**
- Ficha completa de cliente
- Historial de reservas
- Comunicaciones (email, SMS, WhatsApp)
- Notas y tareas
- Documentos adjuntos

**C) Gestión de Agencias:**
- Onboarding de nuevas agencias
- Configuración de comisiones
- Monitoreo de actividad
- Pagos y facturación
- Performance metrics

**D) Gestión de Corporativos:**
- Contratos corporativos
- Políticas negociadas
- Volumen de reservas
- Descuentos especiales
- Account manager asignado

### **Base de Datos:**

```sql
CREATE TABLE crm_contacts (
    id SERIAL PRIMARY KEY,
    contact_type VARCHAR(20), -- 'lead', 'client', 'agency', 'corporate'
    tenant_id INTEGER REFERENCES tenants(id),
    user_id INTEGER REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id), -- Account manager
    status VARCHAR(20), -- 'active', 'inactive', 'churned'
    source VARCHAR(50), -- 'web', 'referral', 'marketing'
    ltv DECIMAL(10,2), -- Lifetime value
    first_contact_date DATE,
    last_contact_date DATE,
    next_followup_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crm_interactions (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES crm_contacts(id),
    interaction_type VARCHAR(50), -- 'call', 'email', 'meeting', 'whatsapp'
    subject VARCHAR(255),
    notes TEXT,
    outcome VARCHAR(50), -- 'positive', 'negative', 'neutral'
    performed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crm_tasks (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES crm_contacts(id),
    assigned_to INTEGER REFERENCES users(id),
    task_type VARCHAR(50), -- 'call', 'email', 'followup'
    description TEXT,
    due_date TIMESTAMP,
    priority VARCHAR(20), -- 'low', 'medium', 'high'
    status VARCHAR(20), -- 'pending', 'completed', 'cancelled'
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crm_pipeline (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES crm_contacts(id),
    stage VARCHAR(50), -- 'lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'
    estimated_value DECIMAL(10,2),
    probability INTEGER, -- 0-100%
    expected_close_date DATE,
    notes TEXT,
    moved_to_stage_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# 2️⃣ FACTURACIÓN ELECTRÓNICA

## Integración con SAT (México)

### **Funcionalidades:**

**A) Generación de CFDI:**
- Timbrado automático al confirmar reserva
- Tipos de comprobante: Ingreso, Egreso, Nómina
- Métodos de pago: PUE, PPD
- Régimen fiscal configurable
- Serie y folio automático

**B) Configuración:**
- Certificados digitales (CSD)
- Contraseña llave privada
- Datos fiscales de AS Operadora
- Series de facturación

**C) Funcionalidades SAT:**
- Timbrado en tiempo real
- Validación de RFC
- Cancelación de CFDI
- Complementos de pago
- Carta porte (si aplica)

**D) Almacenamiento:**
- XML (timbrado)
- PDF (representación impresa)
- Envío automático por email
- Portal de auto-descarga para clientes

### **Proveedor Recomendado:**
- **Facturama** (API de facturación)
- **SW Sapien** (alternativa)
- **Finkok** (alternativa)

**Pricing:** ~$350-500 MXN/mes (250-300 timbres incluidos)

### **Base de Datos:**

```sql
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_type VARCHAR(20), -- 'income', 'expense', 'payment'
    tenant_id INTEGER REFERENCES tenants(id), -- Agencia (si aplica)
    booking_id INTEGER REFERENCES bookings(id),
    customer_user_id INTEGER REFERENCES users(id),
    -- Datos fiscales
    customer_rfc VARCHAR(13) NOT NULL,
    customer_legal_name VARCHAR(255) NOT NULL,
    customer_tax_regime VARCHAR(10),
    customer_postal_code VARCHAR(10),
    customer_email VARCHAR(255),
    -- Factura
    series VARCHAR(10),
    folio INTEGER,
    invoice_number VARCHAR(50) UNIQUE, -- Serie + Folio
    currency VARCHAR(3) DEFAULT 'MXN',
    exchange_rate DECIMAL(12,6) DEFAULT 1.0,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(10), -- PUE, PPD
    payment_form VARCHAR(10), -- 01=Efectivo, 03=Transferencia, 04=Tarjeta
    -- CFDI
    cfdi_use VARCHAR(10), -- G03=Gastos, P01=Por definir
    uuid VARCHAR(100) UNIQUE, -- UUID del timbrado
    xml_url TEXT,
    pdf_url TEXT,
    status VARCHAR(20), -- 'draft', 'stamped', 'cancelled'
    stamped_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    -- Auditoría
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id),
    product_code VARCHAR(20), -- Código SAT
    unit VARCHAR(10), -- E48=Servicio, H87=Pieza
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 16.00, -- IVA 16%
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL
);

CREATE TABLE tax_configuration (
    id SERIAL PRIMARY KEY,
    -- Certificados
    cer_file TEXT, -- Certificado .cer (base64)
    key_file TEXT, -- Llave privada .key (base64)
    key_password_encrypted TEXT, -- Contraseña encriptada
    -- Datos fiscales
    rfc VARCHAR(13) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    tax_regime VARCHAR(10), -- 601, 612, etc
    postal_code VARCHAR(10),
    -- API Facturación
    api_provider VARCHAR(50), -- 'facturama', 'sw_sapien'
    api_key_encrypted TEXT,
    api_url TEXT,
    -- Estado
    is_active BOOLEAN DEFAULT true,
    cert_expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# 3️⃣ CUENTAS POR COBRAR (CxC)

## Gestión de Cobros

### **Funcionalidades:**

**A) Registro de Cuentas por Cobrar:**
- Automático al crear reserva
- Manual para servicios adicionales
- Vinculación con factura
- Vencimientos configurables

**B) Estados:**
- Pendiente
- Parcialmente pagado
- Pagado
- Vencido
- Incobrable

**C) Seguimiento:**
- Dashboard de CxC
- Alertas de vencimiento
- Recordatorios automáticos
- Reporte de antigüedad de saldos
- Proyección de flujo de efectivo

**D) Cobranza:**
- Envío automático de recordatorios
- Escalación de cobranza
- Notas de crédito
- Bonificaciones

### **Base de Datos:**

```sql
CREATE TABLE accounts_receivable (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id),
    booking_id INTEGER REFERENCES bookings(id),
    customer_user_id INTEGER REFERENCES users(id),
    tenant_id INTEGER REFERENCES tenants(id), -- Cliente (agencia/corporativo)
    -- Montos
    currency VARCHAR(3) DEFAULT 'MXN',
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) NOT NULL,
    -- Fechas
    due_date DATE NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    last_payment_date DATE,
    -- Estado
    status VARCHAR(20), -- 'pending', 'partial', 'paid', 'overdue', 'uncollectible'
    days_overdue INTEGER DEFAULT 0,
    -- Cobranza
    last_reminder_sent TIMESTAMP,
    reminder_count INTEGER DEFAULT 0,
    assigned_collector INTEGER REFERENCES users(id),
    collection_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ar_payments (
    id SERIAL PRIMARY KEY,
    ar_id INTEGER REFERENCES accounts_receivable(id),
    payment_method VARCHAR(50), -- 'cash', 'transfer', 'card', 'check'
    payment_reference VARCHAR(100), -- Número de transacción/cheque
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MXN',
    payment_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    received_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE credit_notes (
    id SERIAL PRIMARY KEY,
    original_invoice_id INTEGER REFERENCES invoices(id),
    ar_id INTEGER REFERENCES accounts_receivable(id),
    reason VARCHAR(100), -- 'cancellation', 'discount', 'refund', 'correction'
    amount DECIMAL(10,2) NOT NULL,
    uuid VARCHAR(100) UNIQUE, -- UUID del CFDI de egreso
    xml_url TEXT,
    pdf_url TEXT,
    status VARCHAR(20),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# 4️⃣ CUENTAS POR PAGAR (CxP)

## Gestión de Pagos a Proveedores

### **Proveedores:**
- Aerolíneas
- Hoteles
- Agencias (comisiones)
- Servicios (seguros, traslados)
- Proveedores de tecnología

### **Funcionalidades:**

**A) Registro de CxP:**
- Automático al confirmar reserva con proveedor
- Vinculación con comprobante fiscal
- Programación de pago
- Aprobaciones (workflows)

**B) Categorías:**
- Costo de ventas (hoteles, vuelos)
- Comisiones (a pagar a agencias)
- Gastos operativos
- Servicios tecnológicos
- Nómina

**C) Programación de Pagos:**
- Calendario de pagos
- Lotes de pago
- Conciliación bancaria
- SPEI automático (API bancaria)

**D) Reportes:**
- Flujo de caja proyectado
- Pagos del mes
- Antigüedad de saldos
- Proveedores con mayor volumen

### **Base de Datos:**

```sql
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    supplier_type VARCHAR(50), -- 'airline', 'hotel', 'agency', 'insurance', 'tech'
    legal_name VARCHAR(255) NOT NULL,
    commercial_name VARCHAR(255),
    rfc VARCHAR(13),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    -- Bancarios
    bank_name VARCHAR(100),
    account_number_encrypted TEXT,
    clabe_encrypted TEXT,
    swift_code VARCHAR(20),
    -- Comerciales
    payment_terms INTEGER, -- Días de crédito
    credit_limit DECIMAL(12,2),
    commission_rate DECIMAL(5,2), -- Para agencias
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts_payable (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id),
    booking_id INTEGER REFERENCES bookings(id),
    invoice_number VARCHAR(100), -- Factura del proveedor
    invoice_xml_url TEXT,
    invoice_pdf_url TEXT,
    -- Montos
    currency VARCHAR(3) DEFAULT 'MXN',
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) NOT NULL,
    -- Fechas
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    last_payment_date DATE,
    -- Estado
    status VARCHAR(20), -- 'pending', 'approved', 'scheduled', 'partial', 'paid'
    approval_status VARCHAR(20), -- 'pending', 'approved', 'rejected'
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    -- Pago
    payment_method VARCHAR(50), -- 'transfer', 'check', 'card'
    payment_reference VARCHAR(100),
    scheduled_payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ap_payments (
    id SERIAL PRIMARY KEY,
    ap_id INTEGER REFERENCES accounts_payable(id),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100), -- Número de transferencia/cheque
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MXN',
    payment_date DATE DEFAULT CURRENT_DATE,
    bank_account_id INTEGER, -- Cuenta desde la que se pagó
    notes TEXT,
    processed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_batches (
    id SERIAL PRIMARY KEY,
    batch_number VARCHAR(50) UNIQUE,
    total_amount DECIMAL(12,2),
    payment_count INTEGER,
    status VARCHAR(20), -- 'draft', 'approved', 'processing', 'completed'
    scheduled_date DATE,
    processed_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE batch_payments (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES payment_batches(id),
    ap_id INTEGER REFERENCES accounts_payable(id),
    amount DECIMAL(10,2) NOT NULL
);
```

---

# 5️⃣ COMISIONES A AGENCIAS

## Sistema de Cálculo y Pago

### **Configuración por Agencia:**

**A) Esquemas de Comisión:**
- **Porcentaje fijo:** 10% de la venta
- **Escalonado por volumen:**
  - 0-10 ventas: 8%
  - 11-50 ventas: 10%
  - 51+: 12%
- **Por tipo de servicio:**
  - Vuelos: 5%
  - Hoteles: 12%
  - Paquetes: 15%

**B) Cálculo:**
- Base de comisión (precio sin IVA o con IVA)
- Descuentos aplicables
- Retención de impuestos (si aplica)

**C) Pago:**
- Frecuencia (semanal, quincenal, mensual)
- Método (transferencia, cheque)
- Mínimo para pago
- Estado de cuenta mensual

### **Base de Datos:**

```sql
CREATE TABLE agency_commission_config (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER REFERENCES tenants(id),
    commission_type VARCHAR(20), -- 'fixed', 'tiered', 'by_service'
    default_rate DECIMAL(5,2), -- Porcentaje default
    payment_frequency VARCHAR(20), -- 'weekly', 'biweekly', 'monthly'
    payment_method VARCHAR(20), -- 'transfer', 'check'
    minimum_payout DECIMAL(10,2) DEFAULT 0,
    withholding_tax BOOLEAN DEFAULT false, -- Retención de impuestos
    withholding_percentage DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE commission_tiers (
    id SERIAL PRIMARY KEY,
    config_id INTEGER REFERENCES agency_commission_config(id),
    min_bookings INTEGER,
    max_bookings INTEGER,
    commission_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE commission_by_service (
    id SERIAL PRIMARY KEY,
    config_id INTEGER REFERENCES agency_commission_config(id),
    service_type VARCHAR(50), -- 'flight', 'hotel', 'package', 'activity'
    commission_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Actualizar tabla existente
ALTER TABLE agency_commissions ADD COLUMN withholding_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE agency_commissions ADD COLUMN net_commission DECIMAL(10,2);
ALTER TABLE agency_commissions ADD COLUMN payment_batch_id INTEGER REFERENCES payment_batches(id);
ALTER TABLE agency_commissions ADD COLUMN paid_at TIMESTAMP;
```

---

# 6️⃣ REPORTES FINANCIEROS

## Dashboard Ejecutivo

### **Reportes Principales:**

**A) Estado de Resultados (P&L):**
- Ingresos por tipo (vuelos, hoteles, paquetes)
- Costo de ventas
- Margen bruto
- Gastos operativos
- EBITDA
- Utilidad neta

**B) Balance General:**
- Activos (cuentas por cobrar, inventario)
- Pasivos (cuentas por pagar, comisiones)
- Capital

**C) Flujo de Efectivo:**
- Entradas (cobros)
- Salidas (pagos a proveedores, comisiones)
- Proyección 30/60/90 días

**D) Reportes Operativos:**
- Ventas por agencia
- Comisiones generadas
- Reservas por tipo de cliente
- Top destinos
- Clientes más valiosos (LTV)

**E) KPIs:**
- Tasa de conversión
- Ticket promedio
- Margen por servicio
- Días promedio de cobro (DSO)
- Días promedio de pago (DPO)
- Rotación de inventario

### **Base de Datos:**

```sql
CREATE TABLE financial_accounts (
    id SERIAL PRIMARY KEY,
    account_code VARCHAR(20) UNIQUE, -- 1.1.1 Activo Circulante
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50), -- 'asset', 'liability', 'equity', 'revenue', 'expense'
    parent_account_id INTEGER REFERENCES financial_accounts(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE journal_entries (
    id SERIAL PRIMARY KEY,
    entry_number VARCHAR(50) UNIQUE,
    entry_date DATE NOT NULL,
    description TEXT,
    reference_type VARCHAR(50), -- 'invoice', 'payment', 'booking'
    reference_id INTEGER,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE journal_entry_lines (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER REFERENCES journal_entries(id),
    account_id INTEGER REFERENCES financial_accounts(id),
    debit DECIMAL(12,2) DEFAULT 0,
    credit DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'MXN',
    notes TEXT
);

-- Vista para reportes
CREATE VIEW financial_summary AS
SELECT
    fa.account_type,
    fa.account_name,
    SUM(jel.debit) as total_debit,
    SUM(jel.credit) as total_credit,
    SUM(jel.debit - jel.credit) as balance
FROM journal_entry_lines jel
JOIN financial_accounts fa ON jel.account_id = fa.id
GROUP BY fa.account_type, fa.account_name;
```

---

# 7️⃣ CONTROL DE INVENTARIO (SERVICIOS)

## Gestión de Disponibilidad

### **Inventario de Servicios:**
- Cupos de hotel (si manejan contratos directos)
- Asientos de vuelo (si tienen cupos)
- Paquetes disponibles
- Tours y actividades

### **Funcionalidades:**

**A) Registro:**
- Alta de servicios
- Precio base
- Disponibilidad por fecha
- Reglas de cancelación

**B) Control:**
- Actualización de disponibilidad
- Bloqueos temporales (en proceso de reserva)
- Liberación automática si no se confirma

**C) Alertas:**
- Stock bajo
- Próximo a agotarse
- Cambios de precio del proveedor

### **Base de Datos:**

```sql
CREATE TABLE service_inventory (
    id SERIAL PRIMARY KEY,
    service_type VARCHAR(50), -- 'hotel', 'flight', 'package', 'tour'
    supplier_id INTEGER REFERENCES suppliers(id),
    service_code VARCHAR(100), -- Código del proveedor
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    destination VARCHAR(100),
    cost_price DECIMAL(10,2), -- Costo
    sale_price DECIMAL(10,2), -- Precio de venta
    currency VARCHAR(3) DEFAULT 'MXN',
    available_quantity INTEGER,
    reserved_quantity INTEGER DEFAULT 0,
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES service_inventory(id),
    movement_type VARCHAR(20), -- 'purchase', 'sale', 'reserve', 'release', 'adjustment'
    quantity INTEGER,
    booking_id INTEGER REFERENCES bookings(id),
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# 8️⃣ INTEGRACIONES BANCARIAS

## Conciliación Automática

### **Funcionalidades:**

**A) Conexión Bancaria:**
- API bancaria (BBVA, Santander, Banorte)
- Scraping seguro
- Importación manual (CSV, Excel)

**B) Conciliación:**
- Match automático de pagos
- Sugerencias de conciliación
- Conciliación manual
- Diferencias y ajustes

**C) Reportes:**
- Estado de cuenta
- Movimientos del día
- Saldos por cuenta

### **Proveedores Recomendados:**
- **Finerio Connect** (agregador bancario México)
- **Belvo** (Open Finance API)
- **Plaid** (internacional)

### **Base de Datos:**

```sql
CREATE TABLE bank_accounts (
    id SERIAL PRIMARY KEY,
    bank_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(20), -- 'checking', 'savings'
    account_number_encrypted TEXT,
    clabe_encrypted TEXT,
    currency VARCHAR(3) DEFAULT 'MXN',
    current_balance DECIMAL(12,2),
    last_sync TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bank_transactions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES bank_accounts(id),
    transaction_date DATE NOT NULL,
    description TEXT,
    transaction_type VARCHAR(20), -- 'debit', 'credit'
    amount DECIMAL(12,2) NOT NULL,
    balance_after DECIMAL(12,2),
    reference VARCHAR(100),
    -- Conciliación
    is_reconciled BOOLEAN DEFAULT false,
    reconciled_with_type VARCHAR(20), -- 'ar_payment', 'ap_payment'
    reconciled_with_id INTEGER,
    reconciled_by INTEGER REFERENCES users(id),
    reconciled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# 9️⃣ PERMISOS Y ROLES ADMINISTRATIVOS

## Control de Acceso

### **Roles en AS Operadora:**

**1. Super Admin:**
- Acceso total

**2. Gerente General:**
- Todos los módulos
- Aprobaciones de alto nivel

**3. Director Comercial:**
- CRM
- Ventas
- Agencias

**4. Director Financiero:**
- Facturación
- CxC
- CxP
- Reportes financieros

**5. Contador:**
- Facturación
- Reportes
- Solo lectura en CxC/CxP

**6. Agente de Cobranza:**
- CxC (solo sus asignados)
- Envío de recordatorios

**7. Analista:**
- Solo lectura
- Reportes y dashboards

### **Base de Datos:**

```sql
CREATE TABLE admin_roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE admin_permissions (
    id SERIAL PRIMARY KEY,
    module VARCHAR(50), -- 'crm', 'invoicing', 'ar', 'ap', 'reports'
    permission VARCHAR(50), -- 'view', 'create', 'edit', 'delete', 'approve'
    role_id INTEGER REFERENCES admin_roles(id)
);
```
