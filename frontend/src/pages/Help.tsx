import { useState, type ReactNode } from 'react';
import {
  ChevronDown,
  ChevronRight,
  HelpCircle,
  LogIn,
  ClipboardList,
  Package,
  ClipboardCheck,
  CheckCircle2,
  Scan,
  Truck,
  BarChart3,
  Lightbulb,
  AlertOctagon,
  BookOpen,
} from 'lucide-react';
import clsx from 'clsx';

type Section = {
  id: string;
  title: string;
  icon: typeof HelpCircle;
  cap?: string;
  body: ReactNode;
};

const SECTIONS: Section[] = [
  {
    id: 'intro',
    title: 'Cómo funciona el WMS',
    icon: HelpCircle,
    body: (
      <>
        <p>
          El WMS Chimuelo es la herramienta operativa que reemplaza el proceso manual de preparación de pedidos. Convive con WooCommerce sin reemplazarlo: WC sigue cobrando, gestionando stock y registrando clientes; el WMS toma esos pedidos y los lleva por el ciclo físico de bodega hasta la entrega.
        </p>
        <h4>El ciclo en una mirada</h4>
        <ol>
          <li><strong>Tarde (día anterior):</strong> Bodega 1 prepara los pedidos del día siguiente agrupándolos en secuencias.</li>
          <li><strong>Mañana del despacho:</strong> llega el camión de Bodega 2 con productos consolidados. El operador de carga clasifica las bolsas por ruta escaneando QR.</li>
          <li><strong>10:00 AM:</strong> salen las camionetas. Repartidores entregan, escanean en destino y reciben alerta si hay productos pendientes de Bodega 2 que retirar a granel.</li>
        </ol>
        <h4>Roles</h4>
        <ul>
          <li><strong>Operador Bodega 1:</strong> genera secuencias y cierra el día.</li>
          <li><strong>Picker:</strong> recorre la bodega con el reporte y marca lo recolectado.</li>
          <li><strong>Packer:</strong> arma las bolsas individuales y imprime el albarán.</li>
          <li><strong>Operador de carga:</strong> escanea bolsas en la mañana, las clasifica por ruta y confirma carga al vehículo.</li>
          <li><strong>Repartidor:</strong> escanea en cada entrega para ver contenido + alerta B2.</li>
          <li><strong>Supervisor:</strong> monitorea el dashboard en tiempo real.</li>
        </ul>
        <p>
          Un mismo usuario puede combinar varios roles. Las funciones disponibles se muestran u ocultan según los permisos (capabilities) que el administrador asigne en WordPress.
        </p>
      </>
    ),
  },
  {
    id: 'login',
    title: 'Acceder al sistema',
    icon: LogIn,
    body: (
      <>
        <ol>
          <li>Abre <code>https://wms.chimuelo.cl</code> en cualquier navegador (móvil o desktop).</li>
          <li>Ingresa con el mismo usuario y contraseña que usas en WordPress.</li>
          <li>La primera vez verás un Inicio con los accesos directos a las funciones que tu rol habilita.</li>
        </ol>
        <p className="text-amber-800">
          Si te aparece <em>"No tienes funciones WMS asignadas"</em>, contacta al supervisor para que te active las capabilities <code>wms_*</code> correspondientes en WordPress.
        </p>
        <h4>Instalar como app en el móvil</h4>
        <ol>
          <li>Abre la URL en Chrome (Android) o Safari (iPhone).</li>
          <li>Menú del navegador → <strong>Añadir a pantalla de inicio</strong>.</li>
          <li>Aparece un ícono y se abre como app, sin barra de navegador. Recomendado para operación diaria.</li>
        </ol>
      </>
    ),
  },
  {
    id: 'b1-sequence',
    title: 'Bodega 1: generar una secuencia de picking',
    icon: ClipboardList,
    body: (
      <>
        <p>Una secuencia agrupa varios pedidos para hacer un solo recorrido por la bodega, en lugar de uno por pedido.</p>
        <ol>
          <li>Ir a <strong>Secuencias → Generar</strong>.</li>
          <li>Marca los pedidos que entran en este recorrido (toca la tarjeta para seleccionar).</li>
          <li>Toca <strong>Validar stock</strong>. El sistema consulta WooCommerce y avisa si algún SKU no tiene unidades suficientes — quita esos pedidos o repón antes de continuar.</li>
          <li>Toca <strong>Generar secuencia</strong>. Los pedidos quedan reservados (no se pueden incluir en otra secuencia).</li>
        </ol>
        <p>
          La secuencia abierta queda visible para los pickers en su pantalla de Picking.
        </p>
      </>
    ),
  },
  {
    id: 'picking',
    title: 'Picking: recorrer y recolectar',
    icon: Package,
    body: (
      <>
        <p>El picker toma el reporte agrupado por SKU y hace un solo recorrido por la bodega.</p>
        <ol>
          <li>Ir a <strong>Picking</strong>. Verás dos secciones:
            <ul>
              <li><strong>Picking B1</strong>: las secuencias abiertas con items B1 pendientes (si tienes el rol).</li>
              <li><strong>Picking B2</strong>: una tarjeta por cada secuencia con items B2 a granel pendientes (si tienes el rol).</li>
            </ul>
          </li>
          <li>Entra al reporte. Cada fila es un SKU con foto, cantidad total a recolectar y los pedidos que lo necesitan.</li>
          <li>A medida que recolectas, marca el checkbox. El progreso se actualiza en tiempo real (otros operadores ven el mismo estado).</li>
          <li>Cuando aparezca <strong>"Picking completo"</strong>, pasa al packing.</li>
        </ol>
        <p className="text-amber-800">
          Tip: si dos productos se parecen mucho, mira la foto antes de tomar — es la causa #1 de errores en picking.
        </p>
      </>
    ),
  },
  {
    id: 'packing',
    title: 'Packing: armar bolsas e imprimir albarán',
    icon: ClipboardCheck,
    body: (
      <>
        <ol>
          <li>Desde la secuencia activa, entra a <strong>Empacar pedidos</strong>.</li>
          <li>Elige un pedido de la lista. Verás los items B1 (que van en la bolsa) y, si corresponde, los items B2 (que NO van — se entregan a granel desde Bodega 2).</li>
          <li>Por cada item B1 que metas en la bolsa, marca su checkbox. El sistema bloquea el cierre hasta que todos estén marcados.</li>
          <li>Toca <strong>Cerrar pedido e imprimir albarán</strong>. Se abre un PDF para imprimir y se registra automáticamente quién armó el pedido (trazabilidad).</li>
          <li>Coloca el albarán visible al lado o dentro de la bolsa, asegurando que el QR quede legible.</li>
        </ol>
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
          <strong>⚠ Marca de Bodega 2:</strong> si el pedido tiene productos pendientes de B2, el albarán impreso muestra una banda amarilla GRANDE de "BODEGA 2 PENDIENTE" + lista de items a sacar del granel. Es visible al instante al manipular la bolsa.
        </div>
      </>
    ),
  },
  {
    id: 'close-sequence',
    title: 'Cerrar la secuencia (dos flujos)',
    icon: CheckCircle2,
    body: (
      <>
        <p>Una secuencia tiene <strong>dos cierres independientes</strong>: el flujo B1 (packing terminado) y el flujo B2 (granel recolectado). Cierran por separado y en cualquier orden.</p>
        <ol>
          <li><strong>Cerrar flujo B1</strong>: cuando todos los pedidos están empacados, el equipo de B1 entra a la secuencia → <em>Cerrar flujo B1</em>, valida pedidos esperados vs bolsas empacadas (opcional: ingreso físico de bolsas), confirma.</li>
          <li><strong>Cerrar flujo B2</strong>: cuando el equipo B2 termina de recolectar todos los SKUs a granel, entra al picking B2 de esa secuencia → <em>Cerrar picking B2</em>.</li>
          <li>La secuencia entera pasa a <em>Cerrada</em> cuando ambos flujos están cerrados.</li>
        </ol>
      </>
    ),
  },
  {
    id: 'b2-picking',
    title: 'Picking Bodega 2 (granel, por secuencia)',
    icon: Package,
    body: (
      <>
        <p>El equipo de B2 pickea aparte del equipo B1, pero <strong>para las mismas secuencias</strong>. Cada secuencia tiene su propio listado de items B2 a sacar del granel.</p>
        <ol>
          <li>Abre <strong>Picking</strong>. Verás una tarjeta por cada secuencia con items B2 pendientes.</li>
          <li>Entra a la secuencia. El reporte muestra los SKUs B2 con cantidad total a recolectar y cuántos pedidos los necesitan.</li>
          <li>Recorre con el móvil, marca cada SKU al recolectarlo. El estado se sincroniza en vivo.</li>
          <li>Cuando termines, toca <strong>Cerrar picking B2</strong>. Ese flujo queda cerrado para esa secuencia.</li>
        </ol>
        <p className="text-slate-600">
          El cierre B2 es independiente del cierre B1 (packing). Pueden cerrarse en cualquier orden.
        </p>
      </>
    ),
  },
  {
    id: 'dispatch',
    title: 'Clasificación y carga matinal',
    icon: Scan,
    body: (
      <>
        <p>Cuando llega el camión de B2, las bolsas de B1 ya están armadas. El operador de carga debe distribuir cada bolsa a su camioneta correspondiente.</p>
        <ol>
          <li>Abre <strong>Clasificación</strong>. La cámara se activa.</li>
          <li>Apunta al QR del albarán de la bolsa. En 1-2 segundos el sistema muestra:
            <ul>
              <li>Ruta asignada (R1, R2, ...)</li>
              <li>Posición de carga dentro de la ruta (parada 1, 2, ...)</li>
              <li>Si hay productos B2 pendientes</li>
            </ul>
          </li>
          <li>Lleva la bolsa a la zona de su camioneta.</li>
          <li>Cuando la subes al vehículo, vuelve a escanear (o si ya la tienes en pantalla) y toca <strong>Confirmar carga al vehículo</strong>.</li>
          <li>El panel de "Progreso por ruta" abajo te dice cuántas bolsas faltan por clasificar y cargar para cada camioneta.</li>
        </ol>
        <p className="text-slate-600">
          La distinción <em>clasificada</em> vs <em>cargada</em> permite detectar bolsas que quedaron en el piso después de la clasificación.
        </p>
      </>
    ),
  },
  {
    id: 'delivery',
    title: 'Entrega al cliente',
    icon: Truck,
    body: (
      <>
        <ol>
          <li>Al llegar a la dirección del cliente, abre <strong>Entrega</strong>.</li>
          <li>Escanea el QR del albarán de la bolsa.</li>
          <li>Aparece el contenido del pedido (lo que tienes que entregar dentro de la bolsa).</li>
          <li>
            <strong className="text-amber-800">
              ⚠ Si el pedido tiene productos de Bodega 2 pendientes, vas a ver un banner naranja gigante, el móvil va a sonar dos veces y vibrará.
            </strong>{' '}
            Tienes que tomar esos productos del cargamento a granel del vehículo y agregarlos antes de entregar.
          </li>
          <li>Entrega físicamente (foto, firma, etc. lo gestiona el sistema externo que ya usas).</li>
        </ol>
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 ring-1 ring-amber-200">
          <AlertOctagon className="shrink-0 text-amber-700" size={18} />
          <div className="text-sm text-amber-900">
            La alerta de B2 es lo más crítico del flujo: olvidar un producto del cargamento granel genera entregas incompletas. Por eso es ruidosa.
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'dashboard',
    title: 'Dashboard del supervisor',
    icon: BarChart3,
    body: (
      <>
        <p>El supervisor monitorea el estado del día en tiempo real (refresca solo cada 5 segundos).</p>
        <h4>Qué te muestra</h4>
        <ul>
          <li><strong>KPIs principales:</strong> pedidos activos, pendientes de empacar, listos para clasificar, cargados.</li>
          <li><strong>Alertas activas:</strong> el sistema detecta automáticamente atrasos (muchos pedidos sin secuenciar, secuencias abiertas viejas, pedidos sin ruta, SKUs B2 pendientes).</li>
          <li><strong>Progreso por ruta:</strong> barras de carga por camioneta — útil para saber cuál ya está lista para salir.</li>
          <li><strong>Pedidos por estado:</strong> desglose granular del flujo (recibido → secuenciado → ... → entregado).</li>
          <li><strong>Actividad reciente:</strong> los últimos 15 eventos con quién hizo qué (auditoría rápida).</li>
        </ul>
        <p>
          Si una alerta aparece en amarillo o rojo, abre el módulo correspondiente y resuelve antes de que comprometa la salida a las 10am.
        </p>
      </>
    ),
  },
  {
    id: 'glossary',
    title: 'Glosario · qué significa cada estado y cada término',
    icon: BookOpen,
    body: (
      <>
        <p>El WMS usa algunos términos que pueden aparecer en mensajes, alertas o el dashboard. Acá los traducimos a lenguaje claro:</p>
        <h4>Estados por los que pasa un pedido</h4>
        <ul>
          <li><strong>Pendiente</strong> (en el sistema: <code>received</code>) — el pedido llegó al WMS desde la tienda, está pagado, pero todavía nadie lo tocó. Listo para entrar en una secuencia.</li>
          <li><strong>En secuencia</strong> (<code>sequenced</code>) — fue agrupado con otros pedidos para hacer un solo recorrido de picking. Aún no se recolectó nada.</li>
          <li><strong>Pickeado</strong> (<code>picked</code>) — todos sus items de Bodega 1 ya fueron recolectados de la estantería.</li>
          <li><strong>Empacado</strong> (<code>packed</code>) — la bolsa fue armada, sellada y se imprimió el albarán con QR. Listo para clasificación.</li>
          <li><strong>Clasificado</strong> (<code>classified</code>) — alguien escaneó el QR en la mañana, el sistema le dijo qué ruta y la bolsa se llevó al área de su camioneta.</li>
          <li><strong>Cargado</strong> (<code>loaded</code>) — la bolsa está físicamente arriba del vehículo, lista para salir a reparto.</li>
          <li><strong>Entregado</strong> (<code>delivered</code>) — el sistema externo de entregas confirmó que llegó al cliente. Estado final.</li>
        </ul>
        <h4>Términos que aparecen en alertas</h4>
        <ul>
          <li><strong>Picking</strong> — el acto de recolectar productos de los estantes de la bodega.</li>
          <li><strong>Packing / empaque</strong> — armar la bolsa individual del pedido con sus productos y sellarla.</li>
          <li><strong>Picker</strong> — la persona que hace picking.</li>
          <li><strong>Packer</strong> — la persona que arma las bolsas. Queda registrado quién cerró cada pedido (trazabilidad).</li>
          <li><strong>SKU</strong> — código único de cada producto. Distintos colores o tamaños = distintos SKU.</li>
          <li><strong>Secuencia</strong> — un grupo de pedidos preparados juntos en un solo recorrido. Permite ser eficiente con productos similares.</li>
          <li><strong>Bodega 1 (B1)</strong> — bodega principal donde se hace el picking y packing.</li>
          <li><strong>Bodega 2 (B2)</strong> — bodega satélite con stock distinto. Sus productos llegan en camión a primera hora y se reparten a granel en los camiones de reparto.</li>
          <li><strong>Albarán</strong> — la hoja impresa que va con cada bolsa, con QR + listado de items + (si aplica) marca de Bodega 2 pendiente.</li>
        </ul>
        <h4>"Eliminar la secuencia" — qué se pierde</h4>
        <p>Si eliminas una secuencia donde ya se hizo picking o empaque:</p>
        <ul>
          <li>Los pedidos vuelven al estado <strong>pendiente</strong> para poder reagruparlos.</li>
          <li>Se borra el registro de qué items fueron recolectados.</li>
          <li>Se borra el registro de qué items fueron empacados y quién los empacó.</li>
          <li>Los albaranes ya impresos quedan como papel físico sin reflejo en el sistema. Hay que volver a empacar para imprimir nuevos.</li>
          <li>Los pedidos ya entregados no se tocan: están finalizados.</li>
        </ul>
        <p className="text-slate-600">Usa esta opción solo cuando claramente te equivocaste de pedidos o de modo de picking — no en operación normal.</p>
      </>
    ),
  },
  {
    id: 'tips',
    title: 'Buenas prácticas y errores comunes',
    icon: Lightbulb,
    body: (
      <>
        <h4>Antes de cerrar la jornada (operador Bodega 1)</h4>
        <ul>
          <li>Verifica que TODAS las secuencias estén cerradas.</li>
          <li>Que el dashboard muestre 0 pedidos en estado "recibido" o "secuenciado".</li>
          <li>Que el conteo de bolsas listas coincida con el de pedidos web del día.</li>
        </ul>
        <h4>Durante la mañana (operador de carga)</h4>
        <ul>
          <li>Escanea cada bolsa al recoger del estante, no por lotes — evita perder bolsas.</li>
          <li>Si una bolsa no aparece en el WMS al escanear el QR, no la cargues. Avisa al supervisor (probablemente está mal el sync con WC).</li>
        </ul>
        <h4>Durante el reparto (repartidor)</h4>
        <ul>
          <li>Escanea SIEMPRE antes de entregar, aunque "reconozcas" el pedido. La alerta B2 es la que evita reclamos.</li>
          <li>Si el móvil no escanea por falta de luz, escribe a mano el número del pedido en el buscador (próximamente).</li>
        </ul>
        <h4>Si algo se rompe</h4>
        <ul>
          <li>Recarga la página (F5 en desktop, deslizar hacia abajo en móvil).</li>
          <li>Si persiste, revisa que <code>/api/health</code> responda 200 (el supervisor lo puede verificar).</li>
          <li>Para problemas con un pedido específico, el supervisor puede consultar el log de eventos del dashboard.</li>
        </ul>
      </>
    ),
  },
];

export function Help() {
  const [open, setOpen] = useState<Set<string>>(new Set(['intro']));

  function toggle(id: string) {
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandAll() {
    setOpen(new Set(SECTIONS.map((s) => s.id)));
  }

  function collapseAll() {
    setOpen(new Set());
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Ayuda · Manual de uso</h2>
        <div className="flex gap-2 text-xs">
          <button onClick={expandAll} className="text-brand-700 underline">
            Expandir todo
          </button>
          <button onClick={collapseAll} className="text-brand-700 underline">
            Colapsar todo
          </button>
        </div>
      </div>

      {/* Tabla de contenidos rápida */}
      <nav className="card p-3">
        <div className="text-xs uppercase tracking-wide text-slate-500">Contenido</div>
        <ul className="mt-2 grid gap-1 md:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setOpen((cur) => new Set([...cur, s.id]));
                  setTimeout(() => {
                    document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 0);
                }}
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
              >
                <s.icon size={14} className="text-brand-700" />
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {SECTIONS.map((s) => {
        const isOpen = open.has(s.id);
        const Icon = s.icon;
        return (
          <section key={s.id} id={s.id} className="card overflow-hidden">
            <button
              onClick={() => toggle(s.id)}
              className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50"
            >
              <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
                <Icon size={18} />
              </div>
              <span className="flex-1 font-semibold text-slate-900">{s.title}</span>
              {isOpen ? (
                <ChevronDown size={18} className="text-slate-400" />
              ) : (
                <ChevronRight size={18} className="text-slate-400" />
              )}
            </button>
            {isOpen && (
              <div
                className={clsx(
                  'border-t border-slate-200 px-4 pb-4 pt-3',
                  'prose prose-sm max-w-none text-slate-700',
                  '[&_h4]:mt-4 [&_h4]:font-semibold [&_h4]:text-slate-900',
                  '[&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5',
                  '[&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5',
                  '[&_p]:my-2 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs',
                )}
              >
                {s.body}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
