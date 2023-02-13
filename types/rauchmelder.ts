import { Wohnung } from "./wohnung"

export interface RauchmelderBeziehung{
    id:number,
    aktuelleHistorienID:number,
    wohnungsID:number,
    wohnung?:Wohnung,
    aktuellerRauchmelder:Rauchmelder
}

export interface Rauchmelder{
    id?:number,
    rauchmelderbz?:number,
    raum:string,
    seriennr:string,
    produktionsdatum:Date,
    installedAt?:Date,
    outOfOrderAt?:Date,
    isactive:boolean
}