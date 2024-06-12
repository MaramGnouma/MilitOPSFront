import { Intervenant } from "./intervenant";

export class Montre {
  constructor(
      public nom: string,
      public modele: string,
      public os: string,
      public size: string,
      public connectivity: string,
      public batteryLife: string,
      public marque: string,
      public fonctionnalites?: string,
      public photo?: string,
      public affichage?: string,
      public _id?: string,
      public intervenantId?:Intervenant
  ) {}
}
