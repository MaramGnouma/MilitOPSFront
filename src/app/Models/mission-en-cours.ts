import { AgentMission } from "./agent-mission";
import { Camera } from "./camera";
import { Intervenant } from "./intervenant";

export class MissionEnCours {
  constructor(
    public _id: string,
    public name: string,
    public objectif: string,
    public adresse: string,
    public datedebut: Date,
    public typemission: string,
    public controller: AgentMission,
    public intervenants: Intervenant[],
    public equipements: { equipementId: string, quantiteUtilisee: number }[] ,
    public camera:Camera,
    public notificationId: string,
    public Responsable: AgentMission,
    public heuredebut: string,
    public intervenantWatches: { intervenantId: string, watch: string }[], // Nouvel attribut intervenantWatches
  ) {}
}
