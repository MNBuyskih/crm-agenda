import IAgendaOptions = Agenda.IAgendaOptions;
import ITimeoutService = angular.ITimeoutService;

class AgendaNg {
    options: IAgendaOptions;
    agenda: Agenda.Agenda;

    constructor(private $element: JQuery, private $timeout: ITimeoutService) {
    }

    $onInit() {
        this.$timeout(() => this.agenda = new Agenda.Agenda(this.$element, this.options));
    }
}

angular
    .module('Agenda', [])
    .component('agenda', {
        controller: AgendaNg,
        controllerAs: 'vm',
        bindings: {options: '<', agenda: '='}
    });