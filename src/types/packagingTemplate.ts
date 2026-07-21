/** A reusable packaging option (e.g. "Box of 6", "1 Kg Cake") with its own cost, not tied to one recipe. */
export interface PackagingTemplate {
  id: string;
  name: string;
  cost: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
