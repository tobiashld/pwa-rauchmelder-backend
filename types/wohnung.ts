export interface Wohnung{
    id?:number,
    objektID:number,
    etage:string,
    wohnungslage:'V'|'H'|'L'|'R'|'-'|'VL'|'VR'|'HL'|'HR'|'M'|'MM'
    haus:'Haupthaus'|'Anbau'|'-'
    vorname:string
    nachname:string
}