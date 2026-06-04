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
    title: 'Generar una secuencia',
    icon: ClipboardList,
    body: (
      <>
        <p>Una secuencia agrupa varios pedidos para procesarlos juntos. Es <strong>agnóstica de bodega</strong>: arrastra tanto el picking B1 (para empacar) como el picking B2 (a granel) de los pedidos seleccionados. Cada flujo cierra por separado.</p>

        <h4>Paso 1 · Sincronizar pedidos desde WooCommerce</h4>
        <p>Si los pedidos del día todavía no están en el WMS:</p>
        <ol>
          <li>Elegí un rango de fechas (presets: <em>Hoy</em>, <em>Ayer</em>, <em>Últimos 2 días</em>, o calendario manual).</li>
          <li>Marcá los estados de WC a incluir: <em>Procesando</em>, <em>En espera</em>, <em>Completado</em>, <em>Pendiente pago</em>, <em>En ruta</em>.</li>
          <li>Si cambiaste la <strong>bodega</strong> de algún producto en WC y querés que el WMS lo refleje, marcá <em>Refrescar metadata de productos</em> (más lento, sólo cuando lo necesites — sin esto, el sync reutiliza la bodega cacheada localmente).</li>
          <li>Click <strong>Sincronizar</strong>.</li>
        </ol>
        <p className="text-slate-600">
          El sistema reporta: cuántos pedidos vino WC, cuántos son nuevos, cuántos se actualizaron, cuántos se <strong>saltaron</strong> (pedidos ya en picking/packing — no se tocan para no destruir progreso), y cuáles están tomados por otras secuencias.
        </p>

        <h4>Paso 2 · Elegir el modo de picking</h4>
        <ul>
          <li><strong>Por pedido</strong> (recomendado, default) — el picker recorre <em>pedido por pedido</em>, va metiendo los productos B1 en la bolsa al instante e imprime el albarán al cerrar cada uno. Un solo paso de pick + pack. Mejor cuando los pedidos tienen pocos items distintos.</li>
          <li><strong>Por SKU (batch)</strong> — se agrupan los SKUs de todos los pedidos y el picker hace <em>un solo recorrido</em> tomando el volumen total. Después, en un segundo paso, otro operador arma las bolsas individuales. Más eficiente con muchos pedidos similares.</li>
        </ul>

        <h4>Paso 3 · Seleccionar pedidos y generar</h4>
        <ol>
          <li>Marcá los pedidos pendientes que entran en esta secuencia (o usá <em>Seleccionar todos</em>).</li>
          <li>Click <strong>Validar stock</strong>: el sistema consulta WC y avisa si algún SKU no tiene unidades suficientes — quitá esos pedidos o repón antes de continuar.</li>
          <li>Click <strong>Generar secuencia</strong>. Los pedidos quedan reservados y no pueden incluirse en otra secuencia.</li>
        </ol>
        <p className="text-slate-600">
          La secuencia queda <em>Abierta</em> y visible en la página <strong>Picking</strong> para los equipos B1 y B2.
        </p>
      </>
    ),
  },
  {
    id: 'picking',
    title: 'Picking B1: recorrer y recolectar',
    icon: Package,
    body: (
      <>
        <p>La página <strong>Picking</strong> muestra <em>solo trabajo pendiente</em>. Activá el toggle <em>"Mostrar cerradas"</em> arriba a la derecha si querés ver las secuencias ya cerradas (útil para auditar lo del día sin ir al historial).</p>
        <p>Verás dos secciones:</p>
        <ul>
          <li><strong>Picking Bodega 2 · pendiente</strong>: una tarjeta por cada secuencia con items B2 a granel pendientes.</li>
          <li><strong>Picking Bodega 1 · pendiente</strong>: una tarjeta por cada secuencia con flujo B1 abierto.</li>
        </ul>

        <h4>Modo "Por pedido" (default)</h4>
        <p>La tarjeta dice <em>"Picking + Packing"</em>. Al tocarla vas directo a la <strong>lista de pedidos</strong>:</p>
        <ol>
          <li>Tocá un pedido pendiente. Vas a ver los items B1 (que van en la bolsa) y, si aplica, los B2 listados aparte (no van — se entregan a granel desde B2).</li>
          <li>Por cada item B1 que metas en la bolsa, marcá su checkbox. El sistema bloquea el cierre hasta que todos estén marcados.</li>
          <li>Tocá <strong>Cerrar pedido e imprimir albarán</strong>. Se abre el PDF en una nueva pestaña y queda registrado quién armó el pedido.</li>
          <li>Volvés a la lista, elegís el siguiente pedido, repetís.</li>
        </ol>

        <h4>Modo "Por SKU" (batch)</h4>
        <p>La tarjeta dice <em>"Picking B1"</em>. Al tocarla vas al <strong>reporte agrupado</strong>:</p>
        <ol>
          <li>Cada fila es un SKU con foto, cantidad total a recolectar y cuántos pedidos lo necesitan.</li>
          <li>Hacés un solo recorrido por la bodega tomando el volumen total de cada SKU.</li>
          <li>Marcás cada SKU al recolectarlo — el progreso se sincroniza en vivo (varios pickers pueden trabajar la misma secuencia).</li>
          <li>Cuando aparece <em>"Picking completo"</em>, otro operador entra a <strong>Empacar pedidos</strong> y arma las bolsas individuales con lo recolectado.</li>
        </ol>

        <p className="text-amber-800">
          Tip: si dos productos se parecen mucho, mirá la foto antes de tomar — es la causa #1 de errores en picking.
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
        <p>En modo <strong>Por pedido</strong> esto es parte del mismo flujo de picking. En modo <strong>Por SKU</strong> es el segundo paso después de recolectar todo el batch.</p>
        <ol>
          <li>Desde la secuencia, entrá a <strong>Empacar pedidos</strong> (o <em>Picking + Packing</em> según el modo).</li>
          <li>Elegí un pedido de la lista. Cada tarjeta muestra <strong>ruta</strong> (badge azul), <em>parada de carga</em> y aviso si tiene B2 pendiente.</li>
          <li>Vas a ver los items B1 (que van en la bolsa) y, si aplica, los B2 (que NO van — se entregan a granel desde Bodega 2).</li>
          <li>Por cada item B1 que metas en la bolsa, marcá su checkbox. El sistema bloquea el cierre hasta que todos estén marcados.</li>
          <li>Tocá <strong>Cerrar pedido e imprimir albarán</strong>. Se abre un PDF para imprimir y se registra quién armó el pedido (trazabilidad).</li>
          <li>Colocá el albarán visible al lado o dentro de la bolsa, asegurando que el QR quede legible.</li>
        </ol>

        <h4>Pedidos solo de Bodega 2</h4>
        <p>Si un pedido <strong>no tiene items B1</strong> (todo es de B2), igual lo cerrás desde la lista de empacar:</p>
        <ul>
          <li>No hay items para marcar — el botón cambia a <em>"Imprimir albarán y cerrar"</em>.</li>
          <li>El albarán impreso solo muestra los items B2 a sacar del granel.</li>
          <li>El pedido queda en estado <em>Empacado</em> aunque no se armó bolsa física — el repartidor toma todo desde el cargamento B2 al pasar por el cliente.</li>
        </ul>

        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
          <strong>⚠ Marca de Bodega 2 en el albarán:</strong> si el pedido tiene productos pendientes de B2, el PDF muestra una banda amarilla GRANDE de "BODEGA 2 PENDIENTE" + lista de items a sacar del granel. Es visible al instante al manipular la bolsa.
        </div>

        <h4>Reimprimir un albarán</h4>
        <p>Si se perdió o se manchó el papel, podés reimprimir desde:</p>
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
    title: 'Picking Bodega 2 (granel, por secuencia)',
    icon: Package,
    body: (
      <>
        <p>El equipo de B2 pickea aparte del equipo B1, pero <strong>para las mismas secuencias</strong>. Cada secuencia tiene su propio listado de items B2 a sacar del granel. Generalmente se hace una sola corrida matinal que cubre las secuencias armadas el día anterior.</p>

        <h4>Picking de una secuencia individual</h4>
        <ol>
          <li>Abrí <strong>Picking</strong>. Vas a ver una tarjeta por cada secuencia con items B2 pendientes.</li>
          <li>Tocá la tarjeta. El reporte muestra los SKUs B2 con cantidad total y cuántos pedidos los necesitan.</li>
          <li>Recorré con el móvil, marcá cada SKU al recolectarlo. El estado se sincroniza en vivo entre operadores.</li>
          <li>Cuando termines, tocá <strong>Cerrar picking B2</strong>. El flujo B2 queda cerrado para esa secuencia.</li>
        </ol>

        <h4>Picking conjunto (varias secuencias a la vez)</h4>
        <p>Si en la mañana tenés varias secuencias del día anterior y querés evitar entrar y salir de cada una:</p>
        <ol>
          <li>En <strong>Picking</strong>, marcá el <em>checkbox</em> al lado de cada secuencia B2 que quieras incluir (debe haber al menos 2).</li>
          <li>Aparece un botón flotante <strong>"Picking conjunto (N secuencias)"</strong>. Tocalo.</li>
          <li>Se abre una vista consolidada con todos los SKUs B2 sumados (si dos secuencias piden el mismo SKU, ves la cantidad total).</li>
          <li>Marcás cada SKU al recolectarlo. Cuando termines, <strong>Cerrar picking conjunto</strong>.</li>
          <li>El sistema cierra el B2 <em>solo</em> de las secuencias que quedaron 100% pickeadas. Las que tengan items sin marcar quedan abiertas para otra ronda — vas a ver el resumen en pantalla.</li>
        </ol>
        <p className="text-slate-600">
          El batch es <strong>estático</strong>: si mientras estás pickeando se crea una secuencia nueva, queda para una próxima ronda — no se agrega al batch en curso.
        </p>
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
    id: 'diagnostico',
    title: 'Diagnóstico de un pedido (supervisores)',
    icon: Stethoscope,
    body: (
      <>
        <p>Cuando un pedido se comporta raro (falta una ruta, los items aparecen con la bodega vieja, el sync no lo trae), el supervisor tiene una página dedicada en el sidebar: <strong>Diagnóstico</strong>.</p>
        <ol>
          <li>Pegá el <code>wpOrderId</code> (el ID de WC, no el número del pedido) y tocá <strong>Consultar</strong>.</li>
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
        </ul>

        <h4>Términos del sistema</h4>
        <ul>
          <li><strong>Picking</strong> — recolectar productos de los estantes de la bodega.</li>
          <li><strong>Packing / empaque</strong> — armar la bolsa individual del pedido y sellarla.</li>
          <li><strong>Picker</strong> — la persona que hace picking. Puede haber pickers de B1 y de B2 (equipos separados).</li>
          <li><strong>Packer</strong> — la persona que arma las bolsas. Queda registrado quién cerró cada pedido.</li>
          <li><strong>SKU</strong> — código único de cada producto. Distintos colores o tamaños = distintos SKUs.</li>
          <li><strong>Secuencia</strong> — un grupo de pedidos preparados juntos. Es <em>agnóstica de bodega</em>: tiene tanto picking B1 como B2 que cierran por separado.</li>
          <li><strong>Modo por pedido</strong> — el picker B1 recorre pedido por pedido y arma cada bolsa al instante. Un solo paso pick+pack.</li>
          <li><strong>Modo por SKU (batch)</strong> — primero se recolecta el volumen total agrupado por SKU; en un segundo paso se arman las bolsas individuales.</li>
          <li><strong>Picking conjunto</strong> — agrupar varias secuencias en una sola corrida de picking B2 (cuando el equipo B2 hace la recolección matinal de todo el día).</li>
          <li><strong>Bodega 1 (B1)</strong> — bodega principal donde se arman las bolsas individuales.</li>
          <li><strong>Bodega 2 (B2)</strong> — bodega satélite con stock distinto. Sus productos se recolectan a granel una vez al día y se reparten desde el cargamento de cada camioneta.</li>
          <li><strong>Flujo B1 cerrado / Flujo B2 cerrado</strong> — cada secuencia tiene dos cierres independientes. La secuencia entera pasa a <em>Cerrada</em> solo cuando ambos están cerrados.</li>
          <li><strong>Albarán</strong> — la hoja impresa que va con cada bolsa, con QR, ruta destacada (pill azul), listado de items y (si aplica) marca de Bodega 2 pendiente.</li>
          <li><strong>Ruta</strong> — el reparto al que pertenece el pedido (R1, R2, etc.). Viene de WC en la meta <code>_wdg_route</code>. Sin ruta el pedido no se puede cargar al vehículo.</li>
          <li><strong>Parada de carga</strong> — posición dentro de la ruta (1, 2, ...). Ayuda al orden de carga del vehículo.</li>
          <li><strong>Refrescar metadata de productos</strong> — checkbox en el sync que fuerza a re-leer todos los productos desde WC (más lento). Usar cuando cambiaste la bodega de un producto en WC.</li>
          <li><strong>Pedido bloqueado / saltado</strong> — el sync no toca pedidos que ya estén en estado Recolectado, Empacado, Clasificado, Cargado o Entregado, para no destruir el progreso. Para modificarlos hay que eliminar la secuencia primero.</li>
        </ul>

        <h4>"Eliminar la secuencia" — qué se pierde</h4>
        <p>Si eliminás una secuencia donde ya se hizo picking o empaque:</p>
        <ul>
          <li>Los pedidos vuelven al estado <strong>Recibido</strong> para poder reagruparlos.</li>
          <li>Se borra el registro de qué items fueron recolectados.</li>
          <li>Se borra el registro de qué items fueron empacados y quién los empacó.</li>
          <li>Los albaranes ya impresos quedan como papel físico sin reflejo en el sistema. Hay que volver a empacar para imprimir nuevos.</li>
          <li>Los pedidos ya entregados no se tocan: están finalizados.</li>
        </ul>
        <p className="text-slate-600">Usá esta opción cuando te equivocaste de pedidos o necesitás cambiar la metadata WC (bodega, ruta) de un pedido bloqueado.</p>
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
