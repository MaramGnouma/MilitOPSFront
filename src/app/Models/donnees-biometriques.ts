export class DonneesBiometriques {
  constructor(
    public _id: string,
    public bpm: number,
    public timestamp: Date = new Date()
  ) {}
}
