export type UnitCategory = 'weight' | 'volume' | 'count';

export type WeightUnit = 'g' | 'kg' | 'oz' | 'lb';
export type VolumeUnit = 'ml' | 'l' | 'tsp' | 'tbsp' | 'cup';
export type CountUnit = 'piece';

export type Unit = WeightUnit | VolumeUnit | CountUnit;
