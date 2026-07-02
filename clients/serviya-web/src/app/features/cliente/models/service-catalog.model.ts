export interface ServiceCategory {
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  sortOrder: number;
}

export interface ServiceCatalogItem {
  code: string;
  categoryCode: string;
  name: string;
  description: string | null;
  active: boolean;
  estimatedDurationMinutes: number;
  priceLabel: string;
  imageUrl?: string;
  duracionEstimada?: string;
}
