import { atom } from 'nanostores';
import type { CoffeeBeanRow } from '@/lib/schemas/cafe';

/**
 * Nano store for managing active coffee beans
 * Shared between AddBeanForm and CoffeeLogForm components
 */
export const beansStore = atom<CoffeeBeanRow[]>([]);

/**
 * Nano store for tracking the last added bean ID
 * CoffeeLogForm listens to this to auto-select new beans
 */
export const lastAddedBeanIdStore = atom<string | null>(null);

/**
 * Initialize the store with beans from server
 */
export function initBeans(beans: CoffeeBeanRow[]) {
  beansStore.set(beans);
}

/**
 * Add a new bean to the store and set as last added
 */
export function addBean(bean: CoffeeBeanRow) {
  const currentBeans = beansStore.get();
  beansStore.set([bean, ...currentBeans]);
  lastAddedBeanIdStore.set(bean.id);
}
