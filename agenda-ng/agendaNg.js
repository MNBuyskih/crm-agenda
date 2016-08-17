var AgendaNg = (function () {
    function AgendaNg($element, $timeout) {
        this.$element = $element;
        this.$timeout = $timeout;
    }
    AgendaNg.prototype.$onInit = function () {
        var _this = this;
        this.$timeout(function () { return _this.agenda = new Agenda.Agenda(_this.$element, _this.options); });
    };
    return AgendaNg;
}());
angular
    .module('Agenda', [])
    .component('agenda', {
    controller: AgendaNg,
    controllerAs: 'vm',
    bindings: { options: '<', agenda: '=' }
});
//# sourceMappingURL=agendaNg.js.map