# Proyecto C — sistema visual

## Dirección

Secretaría académica de una IED: formal, legible, sin adornos de SaaS. El membrete institucional (sidebar navy + nombre de la institución) es la firma. El producto es multi-tenant: la identidad visible sale de `src/lib/tenant`, no de literales.

Tenant por defecto: **IED La Victoria** (`ied-la-victoria`).

## Sensación

Calmada y densa como un registro escolar. Color solo para identidad y estado (activo / inactivo / bloqueado).

## Profundidad

Bordes suaves + anillo `ring-1 ring-foreground/10` en cards. Sin sombras dramáticas. Sidebar en navy del tenant; lienzo en papel claro.

## Espaciado

Base 4px. Padding de página `px-4 py-6 sm:px-6`. Cards con `--card-spacing` de shadcn. Header fijo `h-14`.

## Paleta (tokens de marca)

Los valores viven en el tenant y se proyectan a CSS:

| Token | Default IED La Victoria | Uso |
|---|---|---|
| `--brand-navy` | `#1F3864` | Primary, sidebar, títulos |
| `--brand-blue` | `#2E5496` | Enlaces, acentos secundarios |
| `--brand-wine` | `#7B1E28` | Bloqueado, alertas de primer ingreso |
| `--brand-paper` | `#F3F5F8` | Fondo de página |

Clases Tailwind: `bg-brand-navy`, `text-brand-navy`, `text-brand-blue`, `text-brand-wine`, `bg-brand-paper`.

No usar hex sueltos en pantallas. No reintroducir `cuc-*`.

## Tipografía

Geist (Next). Títulos `font-heading` + `text-wrap: balance`. Números de tablas y métricas: `tabular`.

## Patrones

### Header institucional
- Línea 1: `tenant.shortName` en `text-brand-blue` 11px
- Línea 2: `tenant.moduleName` en `text-brand-navy` semibold
- Selector de rol visible (no escondido en el menú)
- Avatar + nombre + rol a la derecha

### Sidebar
- Marca: `tenant.acronym` en recuadro 36px
- Título: `tenant.productName`
- Subtítulo: `tenant.shortName`
- Ítems filtrados por rol (`navForRole`)
- Footer: `tenant.footerNote`

### Page header
- Breadcrumb + `h1` navy + descripción muted + acciones a la derecha

### Tablas
- Card blanca, búsqueda/filtros arriba, empty state con borde dashed, paginación 8–10 filas

### Estados
- ACTIVO: verde esmeralda suave
- INACTIVO: slate
- BLOQUEADO: wine / 10%

### Formularios
- Validación en cliente, error bajo el campo en `text-destructive`
- Guardar → toast sonner + estado local (sin API)

## Multi-tenant

- Catálogo: `src/lib/tenant/catalog.ts`
- Resolución: `getTenant(process.env.NEXT_PUBLIC_TENANT_ID ?? "ied-la-victoria")`
- Correos mock: `staffEmail()` / `studentEmail()` — nunca dominios quemados
- Para otra IED: agregar entrada en `tenants` y opcionalmente `NEXT_PUBLIC_TENANT_ID`
