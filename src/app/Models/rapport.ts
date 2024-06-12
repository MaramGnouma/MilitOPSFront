
export class Rapport {

  constructor(
    public _id: string,
    public userId: string,
    public missionId: string,
    public contenu: string,
    public pdfData: Buffer,
    public dateCreation: Date
  ) {}
}
