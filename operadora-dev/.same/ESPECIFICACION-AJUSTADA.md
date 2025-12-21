# 📋 ESPECIFICACIÓN AJUSTADA - FEEDBACK DEL CLIENTE

## ✅ AJUSTES CONFIRMADOS

### 1️⃣ Usuario Tercero (White-Label)
✅ **CONFIRMADO:** Usuario Tercero depende de Agencia (jerarquía correcta)

### 2️⃣ CRM Extendido
✅ **AJUSTE:** CRM para OPERADORA + AGENCIAS

**CRM OPERADORA (AS Operadora):**
- Gestión de TODOS los clientes (todas las empresas, agencias, usuarios)
- Pipeline de ventas para nuevas empresas/agencias
- Seguimiento de leads corporativos
- Reporting consolidado
- Dashboard ejecutivo

**CRM AGENCIA:**
- Gestión de sus propios clientes
- Pipeline de ventas de la agencia
- Notas y seguimiento
- Reportes de sus clientes

### 3️⃣ Comisiones Configurables
✅ **CONFIRMADO:** Configurables por agencia en 3 rubros

**Configuración por Agencia:**
- % Comisión en VUELOS (ej: 5%)
- % Comisión en HOTELES (ej: 10%)
- % Comisión en PAQUETES (ej: 15%)
- Comisión fija vs porcentual
- Configuración de markup personalizado

---

## 🏢 NUEVO MÓDULO: SISTEMA ADMINISTRATIVO/ERP

### **REQUERIMIENTO:** Sistema administrativo completo para AS Operadora

Este es un **ERP ligero** integrado con la plataforma.

---

## 📊 MÓDULOS ADMINISTRATIVOS

### **1. FACTURACIÓN** 🧾

**Funcionalidades:**
- Facturación automática de reservas
- Facturación global (CFDI 4.0 México)
- Facturas a empresas/corporativos
- Facturas a agencias
- Notas de crédito
- Cancelaciones (SAT)
- Descarga XML + PDF
- Envío automático por email

**Tipos de factura:**
- **Público en general** (usuario final)
- **Factura empresarial** (corporativos)
- **Factura de comisiones** (a agencias)

**Integraciones:**
- PAC (Proveedor Autorizado de Certificación)
  - Facturama (recomendado)
  - FacturAPI
  - Aspel
- e.firma (certificado digital SAT)

**BD - Tablas:**
```sql
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_type VARCHAR(20), -- 'booking', 'commission', 'subscription'
    invoice_number VARCHAR(50) UNIQUE,
    series VARCHAR(10),
    folio INTEGER,
    tenant_id INTEGER REFERENCES tenants(id),
    user_id INTEGER REFERENCES users(id),
    booking_id INTEGER REFERENCES bookings(id),
    -- RFC y datos fiscales
    rfc VARCHAR(13) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    tax_regime VARCHAR(10),
    zip_code VARCHAR(10),
    -- Montos
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MXN',
    -- SAT
    uuid VARCHAR(36), -- UUID del SAT
    xml_url TEXT,
    pdf_url TEXT,
    status VARCHAR(20), -- 'draft', 'issued', 'cancelled'
    issued_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id),
    description TEXT,
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    tax_rate DECIMAL(5,2),
    amount DECIMAL(10,2),
    sat_product_code VARCHAR(10), -- Clave SAT
    sat_unit_code VARCHAR(10) -- Clave unidad SAT
);
```

---

### **2. CUENTAS POR COBRAR** 💰

**Funcionalidades:**
- Estado de cuenta de clientes
- Pagos pendientes
- Pagos vencidos
- Recordatorios automáticos
- Crédito a empresas/agencias
- Límite de crédito
- Corte y antigüedad de saldos

**Casos de uso:**
- **Empresas corporativas:** Crédito de 30 días
- **Agencias:** Crédito de 15 días
- **Usuarios finales:** Pago inmediato

**BD - Tablas:**
```sql
CREATE TABLE accounts_receivable (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    invoice_id INTEGER REFERENCES invoices(id),
    amount_due DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20), -- 'pending', 'partial', 'paid', 'overdue'
    days_overdue INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE credit_limits (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) UNIQUE,
    credit_limit DECIMAL(10,2) NOT NULL,
    current_balance DECIMAL(10,2) DEFAULT 0,
    available_credit DECIMAL(10,2),
    payment_terms_days INTEGER DEFAULT 30, -- 15, 30, 60 días
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    account_receivable_id INTEGER REFERENCES accounts_receivable(id),
    payment_method VARCHAR(50), -- 'card', 'transfer', 'cash', 'check'
    amount DECIMAL(10,2) NOT NULL,
    reference VARCHAR(100),
    payment_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Reportes:**
- Antigüedad de saldos (0-30, 31-60, 61-90, >90 días)
- Estado de cuenta por cliente
- Proyección de flujo de efectivo
- Clientes morosos

---

### **3. CUENTAS POR PAGAR** 📤

**Funcionalidades:**
- Proveedores (aerolíneas, hoteles, etc.)
- Facturas de proveedores
- Programación de pagos
- Conciliación bancaria
- Reportes de gastos

**Proveedores típicos:**
- Aerolíneas
- Cadenas hoteleras
- Servicios de transporte
- GDS (Amadeus, Sabre)
- Servicios (Twilio, SendGrid, etc.)

**BD - Tablas:**
```sql
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_type VARCHAR(50), -- 'airline', 'hotel', 'service', 'gds'
    rfc VARCHAR(13),
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    payment_terms_days INTEGER DEFAULT 30,
    bank_account VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts_payable (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id),
    invoice_number VARCHAR(100),
    invoice_date DATE,
    amount DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20), -- 'pending', 'scheduled', 'paid'
    payment_scheduled_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplier_payments (
    id SERIAL PRIMARY KEY,
    account_payable_id INTEGER REFERENCES accounts_payable(id),
    payment_method VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL,
    reference VARCHAR(100),
    payment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Reportes:**
- Programación de pagos semanal/mensual
- Pagos realizados
- Proveedores por pagar
- Conciliación bancaria

---

### **4. CONTABILIDAD BÁSICA** 📒

**Funcionalidades:**
- Catálogo de cuentas
- Pólizas contables
- Libro diario
- Balance general
- Estado de resultados
- Cierre mensual

**Integración:**
- Exportar a Excel/CSV
- Exportar a CONTPAQi
- Exportar a QuickBooks

**BD - Tablas:**
```sql
CREATE TABLE chart_of_accounts (
    id SERIAL PRIMARY KEY,
    account_number VARCHAR(20) UNIQUE,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50), -- 'asset', 'liability', 'equity', 'income', 'expense'
    parent_account_id INTEGER REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE journal_entries (
    id SERIAL PRIMARY KEY,
    entry_number VARCHAR(50) UNIQUE,
    entry_date DATE NOT NULL,
    description TEXT,
    source VARCHAR(50), -- 'booking', 'invoice', 'payment', 'manual'
    source_id INTEGER, -- ID del booking, invoice, etc.
    status VARCHAR(20), -- 'draft', 'posted'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE journal_entry_lines (
    id SERIAL PRIMARY KEY,
    journal_entry_id INTEGER REFERENCES journal_entries(id),
    account_id INTEGER REFERENCES chart_of_accounts(id),
    debit DECIMAL(10,2) DEFAULT 0,
    credit DECIMAL(10,2) DEFAULT 0,
    description TEXT
);
```

---

### **5. REPORTES EJECUTIVOS** 📈

**Dashboards:**

**A) Dashboard Financiero:**
- Ingresos del mes
- Ingresos por canal (directo, agencias, corporativos)
- Comisiones pagadas a agencias
- Cuentas por cobrar pendientes
- Flujo de caja proyectado
- Rentabilidad por servicio

**B) Dashboard Operativo:**
- Reservas del mes
- Reservas por destino
- Ocupación promedio
- Tiempo promedio de reserva a viaje
- Cancelaciones

**C) Dashboard Comercial (CRM):**
- Leads activos
- Conversión de leads
- Nuevos clientes
- Clientes activos vs inactivos
- Lifetime value por cliente

**Reportes exportables:**
- Excel
- PDF
- CSV
- API para BI externo (Power BI, Tableau)

---

### **6. GESTIÓN DE PROVEEDORES** 🤝

**Funcionalidades:**
- Catálogo de proveedores
- Contratos con aerolíneas/hoteles
- Tarifas negociadas
- Evaluación de proveedores
- Historial de compras

**BD - Tablas:**
```sql
CREATE TABLE supplier_contracts (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id),
    contract_number VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    commission_rate DECIMAL(5,2), -- % que nos dan
    discount_rate DECIMAL(5,2), -- % descuento
    payment_terms VARCHAR(100),
    contract_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE negotiated_rates (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id),
    service_type VARCHAR(50), -- 'flight', 'hotel', 'car'
    destination VARCHAR(100),
    rate DECIMAL(10,2),
    currency VARCHAR(3),
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### **7. INVENTARIO (Opcional)** 📦

Si manejan productos físicos (tarjetas SIM, seguros, etc.)

**Funcionalidades:**
- Control de stock
- Entrada/salida
- Punto de reorden
- Valuación de inventario

---

## 📋 FUNCIONALIDADES ORIGINALES PENDIENTES

### De tu lista inicial de "Próximas Funcionalidades Sugeridas":

**1. Página de detalles del hotel** ✅
- Galería de imágenes
- Mapa interactivo
- Amenidades detalladas
- Reseñas de usuarios
- Políticas de cancelación
- Habitaciones disponibles

**2. Sistema de reservas completo** ✅
- Carrito de compras
- Checkout multi-paso
- Confirmación por email
- Generación de vouchers
- Códigos de confirmación

**3. Panel de usuario** ✅
- Dashboard personal
- Mis reservas (activas, pasadas, canceladas)
- Mis favoritos
- Mi perfil
- Mis viajeros frecuentes
- Mis documentos
- Mis métodos de pago
- Historial de puntos AS Club

**4. Migrar frontend para usar APIs reales** ✅
- Reemplazar localStorage por llamadas API
- Login/Registro con JWT
- Búsquedas en tiempo real
- Favoritos en BD

**5. Sistema de favoritos con BD** ✅
- Guardar hoteles/vuelos favoritos
- Listas personalizadas
- Compartir listas
- Alertas de precio en favoritos

**6. Búsqueda de hoteles real conectada a PostgreSQL** ✅
- Filtros avanzados
- Ordenamiento
- Paginación
- Búsqueda por mapa
- Búsqueda por cercanía

**7. Panel de administración** ✅
- CRUD de hoteles
- CRUD de vuelos
- Gestión de usuarios
- Gestión de empresas/agencias
- Configuración de comisiones
- Configuración de políticas
- Gestión de promociones/ofertas

**8. Integración de pagos** ✅
- Stripe
- PayPal
- Mercado Pago
- OXXO Pay (México)
- Transferencia SPEI
- Tokenización de tarjetas
- 3D Secure

**9. Envío de emails de confirmación** ✅
- Email de confirmación de reserva
- Email con voucher/boleto
- Email de recordatorio
- Email de cambios
- Email de cancelación
- Templates profesionales

**10. Más APIs** ✅
- API de búsqueda
- API de favoritos
- API de ofertas dinámicas
- API de recomendaciones
- API pública para agencias

---

## 🗂️ RESUMEN COMPLETO DE MÓDULOS

### **FRONTEND:**
1. ✅ Búsqueda y resultados
2. ✅ Detalles de hotel/vuelo
3. ✅ Carrito y checkout
4. ✅ Panel de usuario
5. ✅ Dashboard corporativo
6. ✅ Dashboard agencia
7. ✅ Panel administrativo (AS Operadora)
8. ✅ CRM

### **BACKEND - CORE:**
9. ✅ Multi-tenancy
10. ✅ Multi-moneda
11. ✅ Autenticación JWT
12. ✅ Roles y permisos
13. ✅ APIs de búsqueda
14. ✅ APIs de reservas
15. ✅ Sistema de favoritos
16. ✅ Workflows de aprobación
17. ✅ Sistema de comisiones
18. ✅ White-label

### **BACKEND - ADMINISTRATIVO:**
19. ✅ Facturación (CFDI 4.0)
20. ✅ Cuentas por cobrar
21. ✅ Cuentas por pagar
22. ✅ Contabilidad
23. ✅ Reportes ejecutivos
24. ✅ Gestión de proveedores
25. ✅ CRM Operadora

### **INTEGRACIONES:**
26. ✅ Pagos (Stripe, PayPal, Mercado Pago)
27. ✅ Exchange Rate API
28. ✅ Email (SendGrid)
29. ✅ SMS (Twilio)
30. ✅ WhatsApp (Twilio)
31. ✅ Facturación (Facturama/FacturAPI)
32. ✅ Almacenamiento (Vercel Blob / R2)
33. ⚠️ GDS (Amadeus, Sabre) - OPCIONAL/FUTURO

### **SEGURIDAD:**
34. ✅ Encriptación AES-256
35. ✅ Almacenamiento seguro documentos
36. ✅ Audit logs
37. ✅ GDPR compliance
38. ✅ Rate limiting

---

## 📊 BASE DE DATOS FINAL

**Total de tablas: ~35-40**

**Categorías:**
- Core (users, bookings, hotels, etc): 8 tablas
- Multi-tenancy: 5 tablas
- Multi-moneda: 2 tablas
- Documentos: 5 tablas
- Notificaciones: 2 tablas
- Comisiones: 2 tablas
- Facturación: 2 tablas
- Cuentas por cobrar: 3 tablas
- Cuentas por pagar: 3 tablas
- Contabilidad: 3 tablas
- CRM: 4 tablas
- Proveedores: 3 tablas

---

## ⏱️ ESTIMACIÓN DE DESARROLLO ACTUALIZADA

**TOTAL: ~40-50 horas de desarrollo**

### FASE 1: Foundation (8-10h)
- Multi-tenancy
- Multi-moneda
- Roles y permisos
- BD completa

### FASE 2: Features Core (12-15h)
- Búsqueda real
- Detalles de producto
- Carrito y checkout
- Pagos
- Emails

### FASE 3: Dashboards (10-12h)
- Panel usuario
- Dashboard corporativo
- Dashboard agencia
- Panel admin
- CRM

### FASE 4: Administrativo (10-13h)
- Facturación
- Cuentas por cobrar/pagar
- Contabilidad
- Reportes
- Proveedores

---

¿Algún ajuste a esta especificación completa antes de evaluar hosting?
