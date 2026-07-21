/** A reusable optional extra (e.g. "Nutella", "Custom Theme") attachable to a quote. */
export interface AddOn {
  id: string;
  name: string;
  additionalCost: number;
  additionalSellingPrice: number;
  createdAt: string;
  updatedAt: string;
}
