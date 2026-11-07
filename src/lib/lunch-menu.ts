/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/lunch-menu.ts
export type MenuItem = { key: string; label: string; value: string };

export function buildMenuItems(menu: any): MenuItem[] {
  if (!menu) return [];
  const hasSalty2 = !!menu.salty2?.trim();
  return [
    // Chỉ có 1 món mặn thì gọi là "Món mặn", có 2 thì "Món mặn 1/2"
    {
      key: "salty",
      label: hasSalty2 ? "Món mặn 1" : "Món mặn",
      value: menu.salty,
    },
    { key: "salty2", label: "Món mặn 2", value: menu.salty2 },
    { key: "vegetarian", label: "Món chay", value: menu.vegetarian },
    { key: "stir", label: "Món xào", value: menu.stir },
    { key: "soup", label: "Canh", value: menu.soup },
    { key: "dessert", label: "Tráng miệng", value: menu.dessert },
  ].filter((i) => i.value?.trim()); // bỏ món để trống
}
