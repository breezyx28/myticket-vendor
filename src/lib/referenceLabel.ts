export interface BilingualName {
  name: string;
  name_ar?: string | null;
}

export function placeLabel(item: BilingualName, isAr: boolean): string {
  if (isAr && item.name_ar) return item.name_ar;
  return item.name;
}
