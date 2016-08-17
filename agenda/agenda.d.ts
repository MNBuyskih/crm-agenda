declare module Agenda {
    export let Agenda: IAgendaStatic;

    export interface IAgendaOptions {
        hourHeight: number;
        onTimePick?: (start: number[], end: number[]) => void;
        title: string;
    }

    interface IAgendaStatic {
        new(container: JQuery, options: IAgendaOptions): IAgendaInstance;
    }

    interface IAgendaInstance {
        getStartTime(): number[];
        getEndTime(): number[];
        getCoordFromTime(hour: number, min: number): number;
        setTitle(title: string): void;
        setStartTime(hours: number, min: number): void;
        setEndTime(hours: number, min: number): void;
    }
}

declare interface JQuery {
    Agenda(options: Agenda.IAgendaOptions): Agenda.IAgendaInstance;
}
