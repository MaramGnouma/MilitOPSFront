import { AgentMission } from "./agent-mission";
import { Intervenant } from "./intervenant";

export class Missionterminees {
  constructor(
    public _id: string,
    public name: string,
    public objectif: string,
    public adresse: string,
    public datedebut: Date,
    public typemission: string,
    public controller: AgentMission,
    public intervenants: Intervenant[],
    public equipements: { equipementId: string, quantiteUtilisee: number }[],
    public resultat: 'Success' | 'Abandoned' | 'Failed',
    public cause: string,
    public Responsable: AgentMission,
    public dateFin: Date,
    public heureFin: string | null,
    public rate: number | null,
    public heuredebut: string
  ) {}

}
