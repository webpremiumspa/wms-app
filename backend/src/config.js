const required = (key) => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',

  wp: {
    baseUrl: required('WP_BASE_URL').replace(/\/$/, ''),
    jwtSecret: required('WP_JWT_SECRET'),
  },

  wc: {
    consumerKey: required('WC_CONSUMER_KEY'),
    consumerSecret: required('WC_CONSUMER_SECRET'),
    webhookSecret: process.env.WC_WEBHOOK_SECRET || '',
  },

  meta: {
    productWarehouse: process.env.META_PRODUCT_WAREHOUSE || '_wms_bodega',
    orderRoute: process.env.META_ORDER_ROUTE || '_wdg_route',
    orderStopPosition: process.env.META_ORDER_STOP_POSITION || '_wdg_stop_position',
  },
};
