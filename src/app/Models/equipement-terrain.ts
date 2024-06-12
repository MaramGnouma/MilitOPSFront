export class EquipementTerrain {
  constructor(
      public name: string,
      public photo: string,
      public quantite: number,
      public disponible: boolean,
      public armements: string[],
      public accessoires: string[],
      public description: string,
      public dimensions: string[],
      public _id: string,
  ) {}
}
