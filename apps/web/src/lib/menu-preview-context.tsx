"use client";

import {
  asDishId,
  asMealDropId,
  asOfferId,
  ngn,
  type Dish,
  type MealDrop,
  type MenuOffer,
  type VendorDashboardSnapshot,
  type VendorOperatingSchedule,
} from "@mealhrs/domain";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

export type MenuPreviewItem = Readonly<{
  dish: Dish;
  offer: MenuOffer;
  dailyLimit: number;
  remainingToday: number;
  archived: boolean;
}>;

export type MenuPreviewState = Readonly<{
  items: readonly MenuPreviewItem[];
  mealDrops: readonly MealDrop[];
  schedule: VendorOperatingSchedule;
}>;

export type MenuPreviewContextValue = MenuPreviewState & Readonly<{
  updateItem: (offerId: string, update: (item: MenuPreviewItem) => MenuPreviewItem) => void;
  addItem: (item: MenuPreviewItem, mealDrop?: MealDrop) => void;
  addMealDrop: (mealDrop: MealDrop) => void;
  archiveItem: (offerId: string) => void;
  duplicateItem: (offerId: string) => void;
  updateSchedule: (update: (schedule: VendorOperatingSchedule) => VendorOperatingSchedule) => void;
  updateMealDrop: (mealDropId: string, update: (mealDrop: MealDrop) => MealDrop) => void;
  nextIds: () => Readonly<{ dishId: ReturnType<typeof asDishId>; offerId: ReturnType<typeof asOfferId>; mealDropId: ReturnType<typeof asMealDropId> }>;
}>;

const emptySchedule: VendorOperatingSchedule = { weeklyHours: [], maxSimultaneousOrders: 1, pauseImmediate: false, pausePreorders: false, specialClosureNote: "" };
const fallbackPreview: MenuPreviewContextValue = {
  items: [], mealDrops: [], schedule: emptySchedule,
  updateItem: () => undefined, addItem: () => undefined, addMealDrop: () => undefined, archiveItem: () => undefined, duplicateItem: () => undefined,
  updateSchedule: () => undefined, updateMealDrop: () => undefined,
  nextIds: () => ({ dishId: asDishId("preview-dish-fallback"), offerId: asOfferId("preview-offer-fallback"), mealDropId: asMealDropId("preview-drop-fallback") }),
};
const MenuPreviewContext = createContext<MenuPreviewContextValue>(fallbackPreview);

const toState = (dashboard: VendorDashboardSnapshot): MenuPreviewState => ({
  items: dashboard.menu.map(({ dish, offer }) => ({
    dish,
    offer,
    dailyLimit: 25,
    remainingToday: 25,
    archived: false,
  })),
  mealDrops: dashboard.mealDrops,
  schedule: dashboard.operatingSchedule,
});

export function MenuPreviewProvider({ children, dashboard }: Readonly<{ children: ReactNode; dashboard: VendorDashboardSnapshot | null }>) {
  const [state, setState] = useState<MenuPreviewState>(() => dashboard ? toState(dashboard) : { items: [], mealDrops: [], schedule: { weeklyHours: [], maxSimultaneousOrders: 1, pauseImmediate: false, pausePreorders: false, specialClosureNote: "" } });
  const sequence = useRef(1);

  const updateItem = useCallback((offerId: string, update: (item: MenuPreviewItem) => MenuPreviewItem) => {
    setState((current) => ({ ...current, items: current.items.map((item) => item.offer.id === offerId ? update(item) : item) }));
  }, []);
  const addItem = useCallback((item: MenuPreviewItem, mealDrop?: MealDrop) => {
    setState((current) => ({ ...current, items: [...current.items, item], mealDrops: mealDrop ? [...current.mealDrops, mealDrop] : current.mealDrops }));
  }, []);
  const addMealDrop = useCallback((mealDrop: MealDrop) => {
    setState((current) => ({ ...current, mealDrops: [mealDrop, ...current.mealDrops] }));
  }, []);
  const archiveItem = useCallback((offerId: string) => updateItem(offerId, (item) => ({ ...item, archived: true })), [updateItem]);
  const duplicateItem = useCallback((offerId: string) => {
    setState((current) => {
      const source = current.items.find((item) => item.offer.id === offerId);
      if (!source) return current;
      const suffix = sequence.current++;
      const dishId = asDishId(`preview-dish-${suffix}`);
      const copiedOfferId = asOfferId(`preview-offer-${suffix}`);
      if (source.offer.orderingMode !== "immediate") return current;
      const copy: MenuPreviewItem = {
        ...source,
        dish: { ...source.dish, id: dishId, slug: `${source.dish.slug}-copy-${suffix}`, name: `${source.dish.name} copy` },
        offer: { ...source.offer, id: copiedOfferId, dishId, availability: { status: "unavailable", reason: "Paused until this preview dish is ready." } },
        remainingToday: source.dailyLimit,
        archived: false,
      };
      return { ...current, items: [...current.items, copy] };
    });
  }, []);
  const updateSchedule = useCallback((update: (schedule: VendorOperatingSchedule) => VendorOperatingSchedule) => setState((current) => ({ ...current, schedule: update(current.schedule) })), []);
  const updateMealDrop = useCallback((mealDropId: string, update: (mealDrop: MealDrop) => MealDrop) => setState((current) => ({ ...current, mealDrops: current.mealDrops.map((drop) => drop.id === mealDropId ? update(drop) : drop) })), []);
  const nextIds = useCallback(() => {
    const suffix = sequence.current++;
    return { dishId: asDishId(`preview-dish-${suffix}`), offerId: asOfferId(`preview-offer-${suffix}`), mealDropId: asMealDropId(`preview-drop-${suffix}`) };
  }, []);

  const value = useMemo<MenuPreviewContextValue>(() => ({ ...state, updateItem, addItem, addMealDrop, archiveItem, duplicateItem, updateSchedule, updateMealDrop, nextIds }), [state, updateItem, addItem, addMealDrop, archiveItem, duplicateItem, updateSchedule, updateMealDrop, nextIds]);
  return <MenuPreviewContext.Provider value={value}>{children}</MenuPreviewContext.Provider>;
}

export function useMenuPreview() { return useContext(MenuPreviewContext); }

export function isImmediateOrderingOpen(schedule: VendorOperatingSchedule, now = new Date()) {
  if (schedule.pauseImmediate || schedule.specialClosureNote.trim()) return false;
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "Africa/Lagos" }).format(now);
  const hours = schedule.weeklyHours.find((entry) => entry.day === weekday);
  if (!hours?.open) return false;
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Lagos" }).format(now);
  return time >= hours.openTime && time < hours.closeTime;
}

export const previewMoney = (amount: number) => ngn(amount);
