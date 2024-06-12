export class Experience {
  constructor(
    public type: string,
    public annee: Date
  ) {}
}

export class Specialization {
  constructor(
    public name: string,
    public niveau: string
  ) {}
}

export class Certification {
  constructor(
    public nom: string,
    public dateObtention: Date
  ) {}
}

export class Competence {
  constructor(
    public nom: string,
    public niveau: string
  ) {}
}

export class User {
  constructor(
    public _id: string, // si vous avez besoin d'identifiants MongoDB
    public name: string,
    public genre: string,
    public birth: Date,
    public identificationMilitaire: number,
    public adressePersonnelle: string,
    public numeroTelephone: string,
    public etatCivil: string,
    public email: string,
    public image: string,
    public cv: string,
    public date: Date,
    public unit: string,
    public experiences: Experience[],
    public specializations: Specialization[],
    public certifications: Certification[],
    public competences: Competence[],
    public role: 'Superviseur' | 'Controleur',
    public status: 'En attente' | 'Accepté',
    public password: string
  ) {}
}
