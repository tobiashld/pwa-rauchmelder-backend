import { Wohnung } from "./wohnung";

export interface RauchmelderBeziehung {
	id: number;
	aktuelleHistorienID: number;
	wohnungsID: number;
	wohnung?: Wohnung;
	aktuellerRauchmelder: Rauchmelder;
}

export interface Rauchmelder {
	id?: number;
	rauchmelderbz?: number;
	raum: string;
	seriennr: string;
	produktionsdatum: Date;
	installedAt?: Date;
	outOfOrderAt?: Date;
	isactive: boolean;
}

export type PruefungenListe = {
	id?: number;
	timestamp: string;
	rauchmelderID: number;
	grund: number;
	baulichUnveraendert: boolean;
	hindernisseUmgebung: boolean;
	oeffnungenFrei: boolean;
	pruefungErfolgreich: boolean;
	relevanteBeschaedigung: boolean;
	selberRaum: boolean;
	warnmelderGereinigt: boolean;
	batterieGut: boolean;
	anmerkungen: string;
	anmerkungenZwei: string;
};
