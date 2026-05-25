import axios from 'axios';
import { config } from '../config.js';

const wc = axios.create({
  baseURL: `${config.wp.baseUrl}/wp-json/wc/v3`,
  timeout: 20000,
  auth: { username: config.wc.consumerKey, password: config.wc.consumerSecret },
});

export async function wcGetOrder(orderId) {
  const { data } = await wc.get(`/orders/${orderId}`);
  return data;
}

export async function wcListOrders(params = {}) {
  const { data } = await wc.get('/orders', { params: { per_page: 100, ...params } });
  return data;
}

export async function wcGetProduct(productId) {
  const { data } = await wc.get(`/products/${productId}`);
  return data;
}

// Devuelve el valor de un meta por su key, o undefined si no existe.
export function getMeta(entity, key) {
  const list = entity?.meta_data || [];
  const hit = list.find((m) => m.key === key);
  return hit?.value;
}
