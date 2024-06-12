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

export class Intervenant {
  constructor(
    public _id: string, // ID MongoDB
    public name: string,
    public genre: string,
    public datebirth: Date,
    public idMilitaire: number,
    public adresse: string,
    public telephone: string,
    public etatCivil: string,
    public email: string,
    public image: string,
    public cv: string,
    public dateEngagement: Date,
    public unitAffectation: string,
    public experiences: Experience[],
    public specializations: Specialization[],
    public certifications: Certification[],
    public competences: Competence[]
  ) {}
}
