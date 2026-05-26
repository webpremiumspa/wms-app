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

// Trae varios productos en una sola llamada usando ?include=id1,id2,...
// WC permite hasta 100 ids por request.
export async function wcGetProductsByIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const all = [];
  const CHUNK = 100;
  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    const { data } = await wc.get('/products', {
      params: { include: chunk.join(','), per_page: chunk.length },
    });
    all.push(...data);
  }
  return all;
}

// Devuelve el valor de un meta por su key, o undefined si no existe.
export function getMeta(entity, key) {
  const list = entity?.meta_data || [];
  const hit = list.find((m) => m.key === key);
  return hit?.value;
}
