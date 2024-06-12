export class Notification {
  constructor(
    public _id: string,
    public sujet: string,
    public date:Date,
    public heure:string,
    public lieu:string
    )
    {}
}
