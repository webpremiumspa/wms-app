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
          Carmen va a <strong>Secuencias → Generar</strong>, sincroniza 50 pedidos del día desde WC. Click <strong>Generar secuencia (50)</strong> → se crea la Secuencia #12.
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
          En <strong>Secuencia #12 → Cerrar flujo B1</strong>: 49/49 empacados (el <code>expectedBags</code> se actualizó solo cuando se removió #1104520). Confirma cierre B1.
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
          Patricia termina de pickear los items B2 que llegaron en la tarde. Cierra el flujo B2 de la Secuencia #12. La secuencia entera pasa a <strong>Cerrada</strong>.
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
        <p>Si los pedidos del día todavía no están en el WMS:</p>
        <ol>
          <li>Elige un rango de fechas (presets: <em>Hoy</em>, <em>Ayer</em>, <em>Últimos 2 días</em>, o calendario manual).</li>
          <li>Marca los estados de WC a incluir: <em>Procesando</em>, <em>En espera</em>, <em>Completado</em>, <em>Pendiente pago</em>, <em>En ruta</em>.</li>
          <li>Si cambiaste la <strong>bodega</strong> de algún producto en WC y quieres que el WMS lo refleje, marca <em>Refrescar metadata de productos</em>.</li>
          <li>Click <strong>Sincronizar</strong>.</li>
        </ol>

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
          <li>Se ven los items B1 (van en la bolsa) y, si aplica, los B2 (que NO van — se entregan a granel desde Bodega 2).</li>
          <li>Por cada item B1 que se mete en la bolsa, marca su checkbox. El sistema bloquea el cierre hasta que todos estén marcados.</li>
          <li>Toca <strong>Cerrar pedido</strong>. El albarán YA está impreso (se imprimió en batch al armar la secuencia) — se coloca en la bolsa visible.</li>
          <li>Queda registrado quién empacó el pedido (trazabilidad).</li>
        </ol>
        <p className="text-slate-600">
          <strong>Reimprimir albarán</strong>: si la hoja original se rompió o se manchó, puedes reimprimirla desde el pedido empacado. Cada reimpresión genera el albarán nuevo con la info actualizada.
        </p>

        <h4>Pedidos solo de Bodega 2</h4>
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
          <strong>⚠ Marca de Bodega 2 en el albarán:</strong> si el pedido tiene productos pendientes de B2, el PDF muestra una banda amarilla GRANDE de "BODEGA 2 PENDIENTE" + lista de items a sacar del granel. Es visible al instante al manipular la bolsa.
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
    title: 'Picking Bodega 2 (per-pedido, igual que B1)',
    icon: Package,
    body: (
      <>
        <p>El picking B2 funciona <strong>igual que el B1</strong>: el picker escanea el QR del albarán de cada pedido, arma una <em>sub-bolsa</em> con los items B2 específicos de ese pedido, la asocia (atándola o etiquetándola con el número de pedido) y cierra el pedido.</p>

        <h4>Flujo del picker B2</h4>
        <ol>
          <li>El operador de B1 ya armó la secuencia e imprimió los albaranes.</li>
          <li>El picker B2 abre la app y va a <strong>Picking</strong>. Ve una tarjeta por cada secuencia con pedidos B2 pendientes.</li>
          <li>Entra a la secuencia o, alternativamente, escanea el QR del primer albarán directamente desde la cámara del móvil.</li>
          <li>Aparece el pedido con los items B2 que tiene que recolectar de la bodega 2 (foto + SKU + cantidad).</li>
          <li>Por cada item B2 que mete en la sub-bolsa del pedido, marca su checkbox.</li>
          <li>Toca <strong>Cerrar B2 del pedido</strong>. El pedido queda registrado como B2 cerrado, a su nombre.</li>
          <li>Toca <strong>Escanear pedido</strong> o vuelve a la lista para el siguiente.</li>
        </ol>

        <h4>Cierre automático del flujo B2 de la secuencia</h4>
        <p>
          Cuando todos los pedidos con items B2 de una secuencia tienen su B2 cerrado, el flujo B2 de esa secuencia se cierra automáticamente. No hay un botón "cerrar B2 de la secuencia" — es transparente.
        </p>

        <p className="text-slate-600">
          El cierre B2 es independiente del cierre B1 (packing). Pueden cerrarse en cualquier orden y no se condicionan entre sí.
        </p>

        <h4>Si falta un item B2</h4>
        <ul>
          <li>Si el cliente <strong>acepta entrega parcial</strong>: alguien con cap <code>wms_pack_b1</code> aprueba la entrega parcial del pedido y entonces el picker B2 puede cerrar el pedido aunque falte el item.</li>
          <li>Si <strong>no</strong>: deja el pedido sin cerrar y avisa al supervisor. El pedido va a quedar bloqueado en clasificación (no se podrá cargar al vehículo).</li>
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

        <h4>Bloqueo automático por B2 incompleto</h4>
        <p>
          Si al escanear ves un <strong className="text-red-700">banner rojo grande "⚠ B2 INCOMPLETO — NO CARGAR"</strong> con la lista de items faltantes, significa que la pickeadora B2 no encontró stock para ese pedido y nadie autorizó la entrega parcial. El botón <em>"Confirmar carga al vehículo"</em> queda deshabilitado.
        </p>
        <ul>
          <li>Deja la bolsa en un rincón "no cargar" hasta que se resuelva.</li>
          <li>Avisa al encargado de B1 para que llame al cliente o gestione el stock.</li>
          <li>Si el cliente acepta entrega parcial y tienes el rol <code>wms_pack_b1</code> o <code>wms_supervise</code>, puedes autorizarla desde este mismo banner (botón verde <em>"Autorizar entrega parcial"</em>) y cargar al vehículo.</li>
        </ul>

        <h4>Indicadores especiales en la pantalla del pedido</h4>
        <ul>
          <li><strong>Banda verde "✓ Entrega parcial aprobada"</strong>: el pedido se va a cargar aunque le falten items B2 — el cliente ya lo aceptó. Mauricio verá la nota al escanear en la entrega.</li>
          <li><strong>Banner amarillo "Contiene B2"</strong>: el pedido tiene items B2 completos. Recordatorio para no olvidarse del cargamento a granel.</li>
        </ul>
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
              ⚠ Si el pedido tiene productos de Bodega 2 pendientes, vas a ver un banner naranja gigante, el móvil va a sonar dos veces y vibrará.
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
          <li><strong>Recolectado</strong> (<code>picked</code>) — todos sus items de Bodega 1 ya fueron recolectados de la estantería (solo aplica en modo <em>Por SKU</em>).</li>
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
          <li><strong>Bodega 1 (B1)</strong> — bodega principal donde se arman las bolsas individuales.</li>
          <li><strong>Bodega 2 (B2)</strong> — bodega satélite con stock distinto. Sus productos se recolectan a granel una vez al día y se reparten desde el cargamento de cada camioneta.</li>
          <li><strong>Flujo B1 cerrado / Flujo B2 cerrado</strong> — cada secuencia tiene dos cierres independientes. La secuencia entera pasa a <em>Cerrada</em> solo cuando ambos están cerrados.</li>
          <li><strong>Albarán</strong> — la hoja impresa que va con cada bolsa, con QR, ruta destacada (pill azul), listado de items y (si aplica) marca de Bodega 2 pendiente.</li>
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
