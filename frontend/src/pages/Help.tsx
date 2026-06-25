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
  Stethoscope,
  Theater,
  Activity,
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
          <li><strong>Tarde (día anterior):</strong> Bodega 1 - Local prepara los pedidos del día siguiente agrupándolos en secuencias.</li>
          <li><strong>Mañana del despacho:</strong> llega el camión de Bodega 2 - El Sol con productos consolidados. El operador de carga clasifica las bolsas por ruta escaneando QR.</li>
          <li><strong>10:00 AM:</strong> salen las camionetas. Repartidores entregan, escanean en destino y reciben alerta si hay productos pendientes de Bodega 2 - El Sol que retirar a granel.</li>
        </ol>
        <h4>Roles</h4>
        <ul>
          <li><strong>Operador Bodega 1 - Local:</strong> genera secuencias y cierra el día.</li>
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
    id: 'procesos',
    title: 'Procesos de preparación y carga',
    icon: Truck,
    body: (
      <>
        <p>
          El <strong>Proceso de preparación y carga</strong> es la unidad operativa de más alto nivel. Cada turno (matutino o vespertino) tiene su propio proceso. Dentro de un proceso vivien todas las secuencias del día.
        </p>

        <h4>Restricciones</h4>
        <ul>
          <li><strong>Solo puede haber 1 proceso abierto a la vez</strong>. Para abrir otro hay que cerrar el actual.</li>
          <li><strong>Toda secuencia pertenece a un proceso</strong>. No se puede generar secuencias sin un proceso activo.</li>
          <li><strong>El picking Bodega 2 - El Sol es a nivel del proceso</strong>, no de secuencia individual. Se hace una sola vez para todas las secuencias del proceso.</li>
        </ul>

        <h4>Ciclo de vida</h4>
        <ol>
          <li><strong>Crear</strong>: el encargado va a <strong>Procesos → Nuevo proceso</strong>. El sistema sugiere un nombre según hora actual ("Matutino DD/MM" o "Vespertino DD/MM"), editable.</li>
          <li><strong>Generar secuencias</strong>: desde el detalle del proceso, "Generar nueva secuencia" → selecciona pedidos del día → quedan asociadas automáticamente al proceso.</li>
          <li><strong>Empacar</strong>: cada picker B1 escanea albaranes y empaca pedido por pedido. La secuencia se cierra con el packing completo.</li>
          <li><strong>Picking B2 del proceso</strong>: una persona del equipo B2 abre <em>Picking Bodega 2 - El Sol del proceso</em> y recolecta todos los items B2 de todas las secuencias en una sola corrida.</li>
          <li><strong>Clasificar y cargar</strong>: el operador de carga escanea cada bolsa empacada, el sistema dispara la vista de clasificación → confirma → después de un segundo escaneo dispara la vista de carga → confirma.</li>
          <li><strong>Cierre automático</strong>: cuando todos los pedidos del proceso están cargados (o entregados), el proceso se cierra solo. Override manual disponible para supervisores en el detalle del proceso.</li>
        </ol>

        <h4>Vista del proceso</h4>
        <ul>
          <li><strong>KPI grande arriba</strong>: barra de progreso "cargados / total" con verde al 100%.</li>
          <li><strong>Lista de secuencias</strong> del proceso, con conteo de empacados / total.</li>
          <li><strong>Kanban</strong> (toggle desde Lista): pedidos agrupados por estado en 6 columnas — Pendiente · Empacado · Clasificado · Cargado · Entregado · Bloqueado. Útil para supervisión.</li>
          <li><strong>Refrescar rutas</strong>: si la app externa de rutas asignó después de empacar, forzá una resync de rutas/conductor/patente para todos los pedidos del proceso.</li>
        </ul>

        <h4>Vista calendario</h4>
        <p>
          En <strong>Procesos → Calendario</strong>, ves el mes con cada día coloreado según haya procesos abiertos (ámbar) o cerrados (verde). Toca un día para expandir sus procesos. Útil para ver la cadencia (idealmente 1-2 procesos por día).
        </p>

        <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 ring-1 ring-slate-200">
          <strong>Acceso:</strong> el menú lateral solo tiene <em>Procesos</em>. Secuencias y picking ya no tienen item propio en el sidebar — todo se accede entrando primero al proceso.
        </div>
      </>
    ),
  },
  {
    id: 'use-case',
    title: 'Caso de uso · un día completo en el WMS',
    icon: Theater,
    body: (
      <>
        <p>
          Esta sección sigue un día típico del WMS con personajes concretos, incluyendo los casos de excepción (pedido sin stock, items B2 faltantes, entrega parcial). Sirve para ver cómo se combinan todas las pantallas en la operación real.
        </p>

        <h4>Personas y permisos</h4>
        <ul>
          <li><strong>Carmen</strong> — Encargada de B1 (<code>wms_pack_b1</code>). Crea secuencias, cierra el flujo B1 y aprueba entregas parciales al hablar con el cliente.</li>
          <li><strong>José</strong> — Picker B1 (<code>wms_pack_b1</code>). Escanea el QR del albarán para tomar el pedido, arma la bolsa y cierra.</li>
          <li><strong>Patricia</strong> — Pickeadora B2 (<code>wms_pack_b2</code>). Arma la sub-bolsa B2 de cada pedido y cierra.</li>
          <li><strong>Diego</strong> — Operador de carga (<code>wms_load</code>). Clasifica y carga a las camionetas.</li>
          <li><strong>Mauricio</strong> — Repartidor. No requiere cap específico: el QR del albarán es público, y el escáner embebido funciona para cualquier usuario logueado.</li>
          <li><strong>Cristian</strong> — Supervisor (<code>wms_supervise</code>). Monitorea, diagnostica, también puede aprobar entregas parciales.</li>
        </ul>

        <h4>🌆 Día 1 · 18:00 — Carmen prepara las secuencias</h4>
        <p>
          Carmen abre <strong>Procesos → Nuevo proceso</strong>, confirma el nombre sugerido "Vespertino DD/MM" y queda activo. Desde el detalle del proceso toca <strong>Generar nueva secuencia</strong>, sincroniza 50 pedidos del día desde WC y los selecciona → se crea la Secuencia #12 dentro del proceso.
        </p>
        <p>
          Después va a <strong>Secuencia #12 → Empacar pedidos</strong> y toca <strong>"Imprimir todos"</strong>. Se genera un PDF con 50 páginas (un albarán por pedido). Lo manda a la impresora. Las hojas salen y las deja apiladas en el área de picking.
        </p>

        <h4>🌃 Día 1 · 18:30 — José hace picking + packing</h4>
        <p>
          José abre la app en el móvil. Toma una hoja del montón (#1104500). Apunta la cámara al QR del albarán → la app abre el pedido y lo <strong>asigna a José</strong> (claim). Empieza a meter los items B1 en la bolsa y los va marcando. Toca <strong>"Cerrar pedido"</strong>. Vuelve al montón, toma otra hoja, escanea, repite.
        </p>
        <p>
          <strong>Caso problema (pedido #1104520):</strong> escanea el QR, abre el pedido. Falta el producto Z en estantería (sin stock B1). No puede cerrar el pedido. En <em>Acciones del operador</em> toca <strong>"Remover de la secuencia"</strong>, elige motivo <em>"Sin stock B1"</em> y agrega un detalle. El pedido pasa a estado <strong>Bloqueado</strong>; la secuencia sigue con 49 pedidos. Aviso a Carmen.
        </p>
        <p>
          <strong>Caso "ya tomado":</strong> Joaquín (otro picker) por error toma la misma hoja de un pedido que José ya estaba empacando. Escanea, abre la app → ve banner amarillo <em>"Tomaste este pedido — antes lo tenía José"</em>. El pedido queda reasignado a Joaquín. Cuando José intente cerrarlo verá error <em>"Este pedido fue reasignado a otro picker"</em> y tendrá que devolver su hoja al montón.
        </p>

        <h4>🌅 Día 2 · 7:00 — Patricia hace picking B2 conjunto</h4>
        <p>
          Patricia abre <strong>Picking</strong> y ve dos tarjetas B2 pendientes: Sec #12 (14 items) y Sec #11 (8 items). Las marca con los checkboxes y arranca el <strong>Picking conjunto</strong> con los 22 SKUs sumados.
        </p>
        <p>
          <strong>No encuentra dos items:</strong> 1× Cargador USB-C (pedido #1104500) y 1× Cable USB-C (pedido #1104530). Cierra el batch parcial. La Sec #11 cierra completa; la Sec #12 sigue abierta con 2 items pendientes. Avisa a Carmen.
        </p>

        <h4>🌅 Día 2 · 8:00 — Carmen resuelve los faltantes</h4>
        <p>Carmen abre <strong>Supervisión</strong> y ve las alertas:</p>
        <ul>
          <li>🔴 <em>"1 pedido bloqueado esperando reactivación"</em> → #1104520. Stock llega el miércoles, lo deja bloqueado.</li>
          <li>🟡 <em>"Secuencia #12: 2 items B2 sin recolectar"</em>.</li>
        </ul>
        <p>Llama a los 2 clientes afectados:</p>
        <ul>
          <li>
            <strong>Cliente de #1104500</strong>: acepta entrega parcial. Carmen va a <strong>Empacar pedidos → #1104500</strong>, toca <strong>"Aprobar entrega parcial"</strong> y deja la nota <em>"Cliente confirma por WhatsApp 8:05, completar el lunes."</em> El pedido queda con badge verde <em>"Entrega parcial aprobada"</em>.
          </li>
          <li>
            <strong>Cliente de #1104530</strong>: no contesta. Lo deja sin aprobar — el sistema lo bloqueará automáticamente en clasificación.
          </li>
        </ul>

        <h4>🌅 Día 2 · 8:15 — Carmen cierra el flujo B1</h4>
        <p>
          En <strong>Secuencia #12 → Cerrar secuencia</strong>: 49/49 empacados (el <code>expectedBags</code> se actualizó solo cuando se removió #1104520). Confirma cierre. La secuencia pasa a <em>Cerrada</em>. Los items B2 que tiene esta secuencia se procesarán a granel desde el proceso, no aquí.
        </p>

        <h4>🌅 Día 2 · 8:30 — Diego clasifica y carga</h4>
        <p>Diego va escaneando las 49 bolsas. Casos que ve:</p>
        <ul>
          <li><strong>Normal</strong>: pantalla con ruta + parada. Carga al vehículo OK.</li>
          <li><strong>Con B2 normal</strong> (#1104525): banner amarillo <em>"⚠ Contiene productos pendientes de B2"</em>. Carga OK.</li>
          <li>
            <strong>Entrega parcial aprobada</strong> (#1104500): banda verde <em>"✓ Entrega parcial aprobada"</em> con la nota de Carmen + banner amarillo normal. Carga OK.
          </li>
          <li>
            <strong>Bloqueado por B2</strong> (#1104530): <strong>banner rojo grande</strong> <em>"⚠ B2 INCOMPLETO — NO CARGAR. Falta: 1× Cable USB-C"</em>. El botón "Confirmar carga" queda deshabilitado. Diego deja la bolsa en el rincón "no cargar" y avisa.
          </li>
        </ul>
        <p>Carmen vuelve a intentar contacto, sin éxito. La bolsa de #1104530 se queda en el local para salir mañana. Las camionetas salen a las 10am con 48 pedidos.</p>

        <h4>🚚 Día 2 · 10:00 — Mauricio entrega</h4>
        <ul>
          <li><strong>Cliente normal</strong>: escanea, entrega.</li>
          <li><strong>Cliente con B2 normal</strong>: 🔔 móvil suena y vibra; banner naranja gigante con items B2 a sacar del granel del vehículo. Los agrega a la bolsa, entrega.</li>
          <li><strong>Cliente #1104500 (parcial aprobada)</strong>: además ve la <em>banda verde "Entrega parcial aprobada"</em>. Sin sorpresa para Mauricio — el cliente sabe que falta el Cargador. Entrega lo que tiene.</li>
        </ul>

        <h4>📊 Día 2 · 19:00 — Cierre del día</h4>
        <p>Cristian revisa el dashboard:</p>
        <ul>
          <li><strong>Estados</strong>: 48 cargados/entregados, 2 bloqueados (en rojo).</li>
          <li><strong>Plan</strong>: cuando llegue el stock del producto Z, reactivar #1104520 (botón en el pedido) → vuelve a <em>Recibido</em> → entra a la próxima secuencia.</li>
        </ul>
        <p>
          Patricia termina de pickear los items B2 que llegaron en la tarde desde <strong>Picking Bodega 2 - El Sol del proceso</strong>. Cuando todos los pedidos del proceso están cargados/entregados, el proceso entero se cierra solo.
        </p>

        <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 ring-1 ring-slate-200">
          <strong>Lo importante de este caso:</strong> el WMS no obliga a "entregar bien o no entregar". Hay 3 válvulas para excepciones: <em>remover pedido</em> (lo saca de la operación del día), <em>bloqueo automático en dispatch</em> (no carga lo que falta), y <em>aprobar entrega parcial</em> (deja salir al cliente que aceptó). El sistema te avisa, el operador decide.
        </div>
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
    title: 'Generar una secuencia',
    icon: ClipboardList,
    body: (
      <>
        <p>Una secuencia agrupa varios pedidos para procesarlos juntos. Es <strong>agnóstica de bodega</strong>: arrastra tanto el picking B1 (para empacar) como el picking B2 (a granel) de los pedidos seleccionados. Cada flujo cierra por separado.</p>

        <h4>Paso 1 · Sincronizar pedidos desde WooCommerce</h4>
        <p>Click único <strong>Sincronizar pedidos en preparación</strong>. Trae al WMS todos los pedidos en estado <code>en-preparacion</code> desde WC. No hay filtro de fecha porque el estado es transitorio — solo trae lo que está activo. Se refresca también la bodega B1/B2 de los productos automáticamente.</p>

        <h4>Paso 2 · Seleccionar pedidos y generar</h4>
        <ol>
          <li>Marca los pedidos pendientes que entran en esta secuencia (o usa <em>Seleccionar todos</em>).</li>
          <li>Click <strong>Validar stock</strong>: el sistema consulta WC y avisa si algún SKU no tiene unidades suficientes.</li>
          <li>Click <strong>Generar secuencia</strong>. Los pedidos quedan reservados.</li>
        </ol>

        <h4>Paso 3 · Imprimir todos los albaranes</h4>
        <p>
          Desde <strong>Secuencia → Empacar pedidos</strong>, toca el botón <strong>"Imprimir todos"</strong> en el bloque superior. Se genera un único PDF con N páginas (una por pedido), cada una con su QR. Lo imprimes de una vez y dejas las hojas en la zona de picking.
        </p>
        <p className="text-slate-600">
          Los pickers van tomando hojas y escaneando el QR con su móvil para "tomar" (claim) el pedido y empezar a empacarlo. El sistema registra quién lo preparó.
        </p>
      </>
    ),
  },
  {
    id: 'picking',
    title: 'Picking B1: recorrer y empacar',
    icon: Package,
    body: (
      <>
        <p>El flujo de picking B1 arranca con los <strong>albaranes impresos</strong>. Cada hoja tiene su QR — el picker lo escanea con el móvil para "tomar" el pedido y armar la bolsa.</p>

        <h4>Para arrancar — el encargado (cap pack_b1)</h4>
        <ol>
          <li>Va a <strong>Secuencia → Empacar pedidos</strong>.</li>
          <li>Click <strong>"Imprimir todos"</strong> → se genera un único PDF con todos los albaranes.</li>
          <li>Imprime el PDF (sale una hoja por pedido). Deja las hojas en el área de picking.</li>
        </ol>

        <h4>Para el picker</h4>
        <ol>
          <li>Toma una hoja del montón.</li>
          <li>Abre la app y escanea el QR de la hoja con la cámara.</li>
          <li>La primera vez le pedirá <strong>iniciar sesión</strong>. Después de loguearse vuelve automáticamente al pedido escaneado.</li>
          <li>El sistema <strong>"toma" (claim)</strong> el pedido a nombre del picker (modelo "último escaneo gana": si otro lo había tomado antes, se reasigna).</li>
          <li>Ve los items B1 (que van en la bolsa) y los B2 (listados aparte — los entrega el granel).</li>
          <li>Marca cada item B1 al meterlo en la bolsa. El sistema bloquea el cierre hasta que todos estén marcados.</li>
          <li>Toca <strong>"Cerrar pedido"</strong> (sin imprimir nada — el albarán ya está). El pedido queda registrado como empacado por ese picker.</li>
          <li>Vuelve a la lista (o agarra el siguiente albarán y escanea).</li>
        </ol>

        <h4>Acceso alternativo desde la lista</h4>
        <p>
          Si el albarán se rompió o no está disponible, también puedes entrar a un pedido tocando su tarjeta en <strong>Empacar pedidos</strong>. El claim se aplica igual (se reasigna a ti).
        </p>

        <h4>Si un pedido ya lo tiene otro</h4>
        <p>
          La tarjeta muestra badge amarillo <em>"Tomado por X"</em> — es informativo. Si entras igual, el pedido se reasigna a ti. Pero importante: <strong>solo el último picker que escaneó puede cerrar el pedido</strong>. Si X tiene la pantalla abierta y tú escaneas después, X verá un error al intentar cerrar (<em>"Este pedido fue reasignado a otro picker. Recarga para continuar."</em>).
        </p>
        <p className="text-slate-600">
          En la práctica: respeta el badge "Tomado por X" salvo que sepas que X ya no está trabajando ese pedido.
        </p>

        <p className="text-amber-800">
          Tip: si dos productos se parecen mucho, mira la foto antes de tomar — es la causa #1 de errores en picking.
        </p>
      </>
    ),
  },
  {
    id: 'packing',
    title: 'Packing: armar la bolsa',
    icon: ClipboardCheck,
    body: (
      <>
        <p>El packing va integrado con el picking — el mismo picker que escaneó el albarán arma la bolsa, marca los checkboxes y cierra el pedido.</p>
        <ol>
          <li>Después de escanear el QR (o entrar desde la lista), el pedido queda <strong>asignado a ese picker</strong>.</li>
          <li>Cada tarjeta muestra <strong>ruta</strong> (badge azul), <em>parada de carga</em> y aviso si tiene B2 pendiente.</li>
          <li>Se ven los items B1 (van en la bolsa) y, si aplica, los B2 (que NO van — se entregan a granel desde Bodega 2 - El Sol).</li>
          <li>Por cada item B1 que se mete en la bolsa, marca su checkbox. El sistema bloquea el cierre hasta que todos estén marcados.</li>
          <li>Toca <strong>Cerrar pedido</strong>. El albarán YA está impreso (se imprimió en batch al armar la secuencia) — se coloca en la bolsa visible.</li>
          <li>Queda registrado quién empacó el pedido (trazabilidad).</li>
        </ol>
        <p className="text-slate-600">
          <strong>Reimprimir albarán</strong>: si la hoja original se rompió o se manchó, puedes reimprimirla desde el pedido empacado. Cada reimpresión genera el albarán nuevo con la info actualizada.
        </p>

        <h4>Pedidos solo de Bodega 2 - El Sol</h4>
        <p>Si un pedido <strong>no tiene items B1</strong> (todo es de B2), igual lo cierras desde la lista de empacar:</p>
        <ul>
          <li>No hay items para marcar — el botón cambia a <em>"Imprimir albarán y cerrar"</em>.</li>
          <li>El albarán impreso solo muestra los items B2 a sacar del granel.</li>
          <li>El pedido queda en estado <em>Empacado</em> aunque no se armó bolsa física — el repartidor toma todo desde el cargamento B2 al pasar por el cliente.</li>
        </ul>

        <h4>Acciones del operador (excepciones)</h4>
        <p>Si al empacar te encuentras con un problema, en la parte inferior de la pantalla del pedido hay dos botones:</p>
        <ul>
          <li>
            <strong className="text-red-700">Remover de la secuencia</strong> — úsalo cuando no puedes cerrar el pedido (sin stock B1, producto dañado, cliente canceló). Se abre un modal donde eliges el motivo. El pedido pasa a estado <em>Bloqueado</em> y sale de esta secuencia. El resto del flujo continúa sin trabarse.
          </li>
          <li>
            <strong className="text-emerald-700">Aprobar entrega parcial</strong> — solo aparece si el pedido tiene B2 pendiente. Úsalo cuando hablaste con el cliente y aceptó recibir el pedido aunque falte alguno de los items B2. Deja una nota explicando el acuerdo. El pedido se "desbloquea" automáticamente en clasificación/carga.
          </li>
        </ul>

        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
          <strong>⚠ Marca de Bodega 2 - El Sol en el albarán:</strong> si el pedido tiene productos pendientes de B2 - El Sol, el PDF muestra una banda amarilla GRANDE de "B2 - EL SOL PENDIENTE" + lista de items a sacar del granel. Es visible al instante al manipular la bolsa.
        </div>

        <h4>Reimprimir un albarán</h4>
        <p>Si se perdió o se manchó el papel, puedes reimprimir desde:</p>
        <ul>
          <li>La pantalla del pedido empacado.</li>
          <li>La pantalla de la secuencia (al expandir cada pedido).</li>
          <li>Después de escanear el QR (con login).</li>
        </ul>
      </>
    ),
  },
  {
    id: 'close-sequence',
    title: 'Cerrar la secuencia',
    icon: CheckCircle2,
    body: (
      <>
        <p>Una secuencia se cierra cuando todos sus pedidos están <strong>empacados</strong>. El picking B2 (a granel) NO afecta el cierre de la secuencia — vive a nivel del proceso y se hace una vez para todas las secuencias.</p>
        <ol>
          <li>Cuando todos los pedidos están empacados, el equipo de B1 entra a la secuencia → <strong>Cerrar secuencia</strong>.</li>
          <li>Valida pedidos esperados vs bolsas empacadas (opcional: ingreso físico de bolsas), confirma.</li>
          <li>La secuencia pasa a <em>Cerrada</em>.</li>
        </ol>
        <p className="text-slate-600">
          Si la secuencia tiene items B2, no necesitas esperar a que el picker B2 termine para cerrarla. Los items B2 quedan pendientes en el proceso y se procesan a granel cuando llegue el momento.
        </p>
      </>
    ),
  },
  {
    id: 'b2-picking',
    title: 'Picking Bodega 2 - El Sol (a nivel proceso)',
    icon: Package,
    body: (
      <>
        <p>El picking B2 se hace <strong>una sola vez por proceso</strong>, no por secuencia. Cuando el camión de B2 - El Sol llega con los productos consolidados del día, una persona se encarga de recolectar TODOS los items B2 de TODAS las secuencias del proceso en una corrida.</p>

        <h4>Cómo se accede</h4>
        <p>
          Desde <strong>Procesos → proceso activo → tarjeta "Picking Bodega 2 - El Sol del proceso"</strong>. No hay item en el menú lateral — el acceso es siempre dentro del proceso.
        </p>

        <h4>Qué vas a ver</h4>
        <ul>
          <li><strong>Tabla agrupada por SKU</strong>: cuánto sacar total de cada producto + a qué pedidos va distribuido. Sirve como guía para recorrer la bodega una vez.</li>
          <li><strong>Filtro por ruta</strong> con contadores <code>R1 - Juan (3/8)</code>. Al filtrar, la tabla agrupada también se filtra.</li>
          <li><strong>Lista de pedidos B2 pendientes</strong> de TODAS las secuencias del proceso, ordenados por ruta + parada.</li>
          <li><strong>Buscador</strong> por número de pedido (resalta la coincidencia).</li>
        </ul>

        <h4>Flujo del picker</h4>
        <ol>
          <li>Recorre la bodega B2 con la lista agrupada y el carro. Sacas todo lo de cada SKU.</li>
          <li>Vuelves a la mesa. Para cada pedido en la lista, escaneas (o tocas) y abres su vista per-pedido.</li>
          <li>Marcas los items B2 de ese pedido y tocas <strong>Cerrar B2 del pedido</strong>. Atas (o etiquetas con el número de pedido) la sub-bolsa B2 a la bolsa B1 ya armada.</li>
          <li>Pasas al siguiente.</li>
        </ol>

        <p className="text-slate-600">
          El cierre B2 del pedido NO afecta el cierre de la secuencia. La secuencia se cierra solo con el packing B1; los items B2 quedan pendientes hasta que el picker B2 los procese.
        </p>

        <h4>Si falta un item B2</h4>
        <ul>
          <li>Si el cliente <strong>acepta entrega parcial</strong>: alguien con cap <code>wms_pack_b1</code> aprueba la entrega parcial del pedido. El picker B2 puede cerrar el pedido aunque falte el item.</li>
          <li>Si <strong>no</strong>: deja el pedido sin cerrar y avisa al supervisor. Va a quedar bloqueado en clasificación (no se podrá cargar al vehículo).</li>
        </ul>
      </>
    ),
  },
  {
    id: 'dispatch',
    title: 'Clasificación y carga matinal',
    icon: Scan,
    body: (
      <>
        <p>La clasificación (agrupar por ruta) y la carga al vehículo son <strong>dos momentos físicos distintos</strong>. Antes estaban juntos en un solo paso; ahora cada uno es un escaneo de QR explícito en su propio momento. <strong>No hay menú "Clasificación"</strong> — todo arranca escaneando el QR del albarán con la cámara del celular.</p>

        <h4>1 · Clasificar (agrupar por ruta)</h4>
        <ol>
          <li>Abre la cámara nativa del celular y apunta al QR del albarán de un pedido empacado.</li>
          <li>El QR abre la app del WMS. La vista cambia según el estado del pedido — para uno empacado vas a ver la <strong>Vista de Clasificación</strong>: ruta destacada (R1 - Juan), parada, alerta B2 si aplica.</li>
          <li>Arriba ves las <strong>pills de progreso por ruta</strong>: <code>R1 - Juan (3/8)</code>, <code>R2 - Pedro (5/5)</code>, etc. La de tu pedido queda destacada en azul.</li>
          <li>Lleva la bolsa a la ruma física de esa ruta.</li>
          <li>Toca <strong>Confirmar clasificación</strong>.</li>
          <li>Aparece una tarjeta verde "✓ Pedido clasificado" + botón <strong>Escanear otro pedido</strong> (abre cámara in-app, más rápido que volver a abrir la cámara del SO). Repite.</li>
        </ol>

        <h4>2 · Cargar al vehículo</h4>
        <p>Cuando las rumas están listas y llegan las camionetas:</p>
        <ol>
          <li>Escanea nuevamente el QR del pedido (cámara externa o botón "Escanear otro pedido" si sigues adentro).</li>
          <li>Como el pedido ya está clasificado, esta vez ves la <strong>Vista de Carga</strong>: pills de progreso <em>cargados</em> por ruta, ruta destacada, botón <strong>Confirmar carga al vehículo</strong>.</li>
          <li>Sube la bolsa al vehículo y toca el botón.</li>
          <li>Tarjeta verde "✓ Cargado al vehículo" + Escanear otro.</li>
        </ol>

        <h4>Bloqueo automático por B2 incompleto</h4>
        <p>
          Si al escanear ves un <strong className="text-red-700">banner rojo grande "⚠ B2 INCOMPLETO — NO {`{clasificar/cargar}`}"</strong> con la lista de items faltantes, significa que el picker B2 no encontró stock para ese pedido y nadie autorizó la entrega parcial. El botón de confirmar queda deshabilitado.
        </p>
        <ul>
          <li>Deja la bolsa en un rincón "no cargar".</li>
          <li>Si tienes rol <code>wms_pack_b1</code> o <code>wms_supervise</code>, puedes autorizar entrega parcial desde el mismo banner (botón verde).</li>
        </ul>

        <h4>Progreso por ruta — en Inicio</h4>
        <p>En la pantalla <strong>Inicio</strong> vas a ver dos widgets con todas las pills de progreso: "Clasificación del día" y "Carga al vehículo del día". Sirve para chequear el estado global antes de arrancar o entre escaneos.</p>

        <h4>Botón "Refrescar rutas" en Inicio</h4>
        <p>Si la app externa asigna rutas DESPUÉS de empacar (caso normal), el webhook de WC ya las trae automáticamente al WMS. Si por algún motivo no llegan, presiona <strong>Refrescar rutas</strong> en Inicio y se sincronizan a mano todas las rutas/paradas/conductor/patente de los pedidos activos.</p>
      </>
    ),
  },
  {
    id: 'tracking',
    title: 'Seguimiento de un pedido (supervisores)',
    icon: Activity,
    body: (
      <>
        <p>Cuando un cliente pregunta "¿qué pasó con mi pedido?" o necesitas auditar qué hizo cada operador, abre <strong>Seguimiento</strong> en el menú (solo visible con cap <code>wms_supervise</code>).</p>
        <ol>
          <li>Ingresa el <code>wpOrderId</code> (el número que ves en WC, ej. <code>1133335</code>) y toca Buscar.</li>
          <li>Aparece toda la trazabilidad del pedido en bloques:
            <ul>
              <li><strong>Estado actual</strong> + badges (status, B2, entrega parcial, método de envío).</li>
              <li><strong>Cliente</strong> — nombre, dirección, método de envío.</li>
              <li><strong>Ruta y reparto</strong> — ruta, parada, conductor (nombre), vehículo, patente. Si no aparecen, es porque el plugin externo no asignó aún.</li>
              <li><strong>Hitos del proceso</strong> — quién y cuándo: claim, packing, cierre B2, clasificación, carga, entrega.</li>
              <li><strong>Productos</strong> — items con bodega + indicador P/E (pickeado / empacado).</li>
              <li><strong>Secuencias asociadas</strong> — historial si el pedido entró a varias secuencias (ej. una se eliminó y volvió a entrar a otra).</li>
              <li><strong>Timeline de eventos</strong> — línea cronológica de cada acción del log con actor, tipo de evento y timestamp exacto.</li>
            </ul>
          </li>
        </ol>
        <p className="text-slate-600">
          Los datos del conductor (id, nombre, patente, vehículo) vienen del plugin woo-delivery-groups vía las metas <code>_wdg_driver_id</code>, <code>_wdg_driver_name</code>, <code>_wdg_vehicle</code>, <code>_wdg_patente</code>. Se actualizan automáticamente vía webhook cada vez que se asigna una ruta.
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
        <p>El repartidor no tiene una pantalla "Entrega" en el menú — el flujo arranca con el escaneo del QR del albarán.</p>
        <ol>
          <li>Al llegar a la dirección del cliente, abre la cámara del móvil (la nativa, no la del WMS) y escanea el QR del albarán de la bolsa. El QR abre la app del WMS en la vista del pedido.</li>
          <li>La primera vez te pedirá iniciar sesión. Después de eso te recuerda hasta que cierres sesión.</li>
          <li>Aparece el contenido del pedido (lo que tienes que entregar dentro de la bolsa) y la ruta destacada.</li>
          <li>
            <strong className="text-amber-800">
              ⚠ Si el pedido tiene productos de Bodega 2 - El Sol pendientes, vas a ver un banner naranja gigante, el móvil va a sonar dos veces y vibrará.
            </strong>{' '}
            Tienes que tomar esos productos del cargamento a granel del vehículo y agregarlos antes de entregar.
          </li>
          <li>Entrega físicamente (foto, firma, etc. lo gestiona el sistema externo que ya usas).</li>
          <li>Para ir al siguiente pedido toca <strong>"Escanear otro pedido"</strong> al pie de la pantalla — la app abre una cámara embebida y, al detectar el QR, te lleva directo al nuevo pedido sin tener que abrir la cámara externa otra vez.</li>
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
    id: 'diagnostico',
    title: 'Diagnóstico de un pedido (supervisores)',
    icon: Stethoscope,
    body: (
      <>
        <p>Cuando un pedido se comporta raro (falta una ruta, los items aparecen con la bodega vieja, el sync no lo trae), el supervisor tiene una página dedicada en el sidebar: <strong>Diagnóstico</strong>.</p>
        <ol>
          <li>Pega el <code>wpOrderId</code> (el ID de WC, no el número del pedido) y toca <strong>Consultar</strong>.</li>
          <li>Vas a ver tres bloques:
            <ul>
              <li><strong>Diagnóstico</strong> — mensajes en castellano explicando qué está mal (ej: <em>"Ruta desincronizada: local=null vs WC=R1"</em>).</li>
              <li><strong>WMS local vs WooCommerce</strong> — comparación lado a lado (estado, ruta, parada, cliente, dirección, items).</li>
              <li><strong>Items locales</strong> — tabla con timestamps de picking y packing por item.</li>
            </ul>
          </li>
          <li>Si la metadata de WC está OK pero local quedó desactualizado, hay dos vías:
            <ul>
              <li>Si el pedido está pendiente o en secuencia abierta → sincronizar con <em>Refrescar metadata de productos</em> activado.</li>
              <li>Si el pedido está empacado/clasificado/cargado → hay que <strong>eliminar la secuencia</strong> primero (revierte el pedido) y después sincronizar.</li>
            </ul>
          </li>
        </ol>
        <p className="text-slate-600">
          También hay un bloque "Toda la metadata de WC" (collapsible) para inspeccionar campo por campo, y "JSON crudo" para copiar y compartir si hace falta soporte técnico.
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
          <li><strong>Recibido</strong> (en el sistema: <code>received</code>) — el pedido llegó al WMS desde WooCommerce, pero todavía no entró a ninguna secuencia. Disponible para reservar.</li>
          <li><strong>En secuencia</strong> (<code>sequenced</code>) — fue agrupado con otros pedidos. Aún no se recolectó nada.</li>
          <li><strong>Recolectado</strong> (<code>picked</code>) — todos sus items de Bodega 1 - Local ya fueron recolectados de la estantería (solo aplica en modo <em>Por SKU</em>).</li>
          <li><strong>Empacado</strong> (<code>packed</code>) — la bolsa fue armada y se imprimió el albarán con QR. Listo para clasificación matinal.</li>
          <li><strong>Clasificado</strong> (<code>classified</code>) — alguien escaneó el QR en la mañana, el sistema le dijo qué ruta y la bolsa se llevó al área de su camioneta.</li>
          <li><strong>Cargado</strong> (<code>loaded</code>) — la bolsa está físicamente arriba del vehículo, lista para salir a reparto.</li>
          <li><strong>Entregado</strong> (<code>delivered</code>) — el sistema externo de entregas confirmó que llegó al cliente. Estado final.</li>
          <li><strong>Bloqueado</strong> (<code>blocked</code>) — el pedido fue removido manualmente de una secuencia (sin stock, cancelación, etc.). Queda esperando a que un encargado lo reactive (botón <em>"Reactivar pedido"</em>) para que entre a una secuencia nueva.</li>
        </ul>

        <h4>Términos del sistema</h4>
        <ul>
          <li><strong>Picking</strong> — recolectar productos de los estantes de la bodega.</li>
          <li><strong>Packing / empaque</strong> — armar la bolsa individual del pedido y sellarla.</li>
          <li><strong>Picker</strong> — la persona que hace picking. Puede haber pickers de B1 y de B2 (equipos separados).</li>
          <li><strong>Packer</strong> — la persona que arma las bolsas. Queda registrado quién cerró cada pedido.</li>
          <li><strong>SKU</strong> — código único de cada producto. Distintos colores o tamaños = distintos SKUs.</li>
          <li><strong>Secuencia</strong> — un grupo de pedidos preparados juntos. Es <em>agnóstica de bodega</em>: tiene tanto picking B1 como B2 que cierran por separado.</li>
          <li><strong>Imprimir todos los albaranes</strong> — un único PDF de N páginas que se genera al armar la secuencia. Cada hoja tiene su QR — los pickers escanean para "tomar" el pedido.</li>
          <li><strong>Claim / Tomar pedido</strong> — al escanear el QR (o entrar al pedido desde la lista), el sistema lo asigna a ese picker. Modelo "último escaneo gana": si otro lo había tomado, se reasigna. Pero solo el último claimer puede cerrar — si dos están trabajando el mismo, el anterior verá error al cerrar.</li>
          <li><strong>Picking conjunto</strong> — agrupar varias secuencias en una sola corrida de picking B2 (cuando el equipo B2 hace la recolección matinal de todo el día).</li>
          <li><strong>Bodega 1 - Local (B1)</strong> — bodega principal donde se arman las bolsas individuales.</li>
          <li><strong>Bodega 2 - El Sol (B2)</strong> — bodega satélite con stock distinto. Sus productos se recolectan a granel una vez al día y se reparten desde el cargamento de cada camioneta.</li>
          <li><strong>Flujo B1 cerrado / Flujo B2 cerrado</strong> — cada secuencia tiene dos cierres independientes. La secuencia entera pasa a <em>Cerrada</em> solo cuando ambos están cerrados.</li>
          <li><strong>Albarán</strong> — la hoja impresa que va con cada bolsa, con QR, ruta destacada (pill azul), listado de items y (si aplica) marca de Bodega 2 - El Sol pendiente.</li>
          <li><strong>Ruta</strong> — el reparto al que pertenece el pedido (R1, R2, etc.). Viene de WC en la meta <code>_wdg_route</code>. Sin ruta el pedido no se puede cargar al vehículo.</li>
          <li><strong>Parada de carga</strong> — posición dentro de la ruta (1, 2, ...). Ayuda al orden de carga del vehículo.</li>
          <li><strong>Refrescar metadata de productos</strong> — checkbox en el sync que fuerza a re-leer todos los productos desde WC (más lento). Usar cuando cambiaste la bodega de un producto en WC.</li>
          <li><strong>Pedido bloqueado / saltado</strong> — el sync no toca pedidos que ya estén en estado Recolectado, Empacado, Clasificado, Cargado o Entregado, para no destruir el progreso. Para modificarlos hay que eliminar la secuencia primero.</li>
          <li><strong>Remover pedido de secuencia</strong> — botón rojo en el detalle del pedido / packing. Saca el pedido individual de la secuencia (sin eliminar la secuencia entera). El pedido pasa a estado <em>Bloqueado</em>. Requiere motivo (sin stock B1, sin stock B2, dañado, cliente canceló, otro).</li>
          <li><strong>Entrega parcial aprobada</strong> — cuando un pedido tiene items B2 que no se pudieron pickear y el cliente acepta recibirlo igual, un operador con <code>wms_pack_b1</code> o <code>wms_supervise</code> puede autorizarlo. Se "desbloquea" para clasificación y carga; el albarán y la pantalla de entrega muestran la nota de aprobación. Reversible (botón <em>"Revocar"</em>).</li>
          <li><strong>Bloqueo automático en dispatch</strong> — si al escanear un pedido en Clasificación tiene items B2 sin pickear y NO está aprobada la entrega parcial, el sistema no permite clasificar ni cargar. Banner rojo grande con el listado de faltantes.</li>
          <li><strong>Reactivar pedido bloqueado</strong> — el supervisor (o cualquiera con <code>wms_pack_b1</code>) puede pasar un pedido de <em>Bloqueado</em> a <em>Recibido</em> cuando se resuelve el problema (llegó stock, etc.). Vuelve a estar disponible para una nueva secuencia.</li>
        </ul>

        <h4>"Eliminar la secuencia" — qué se pierde</h4>
        <p>Si eliminas una secuencia donde ya se hizo picking o empaque:</p>
        <ul>
          <li>Los pedidos vuelven al estado <strong>Recibido</strong> para poder reagruparlos.</li>
          <li>Se borra el registro de qué items fueron recolectados.</li>
          <li>Se borra el registro de qué items fueron empacados y quién los empacó.</li>
          <li>Los albaranes ya impresos quedan como papel físico sin reflejo en el sistema. Hay que volver a empacar para imprimir nuevos.</li>
          <li>Los pedidos ya entregados no se tocan: están finalizados.</li>
        </ul>
        <p className="text-slate-600">Usa esta opción cuando te equivocaste de pedidos o necesitas cambiar la metadata WC (bodega, ruta) de un pedido bloqueado.</p>
      </>
    ),
  },
  {
    id: 'tips',
    title: 'Buenas prácticas y errores comunes',
    icon: Lightbulb,
    body: (
      <>
        <h4>Antes de cerrar la jornada (operador Bodega 1 - Local)</h4>
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
