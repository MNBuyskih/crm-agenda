var Agenda;
(function (Agenda_1) {
    var Agenda = (function () {
        function Agenda(container, options) {
            this.options = options;
            this.gridSize = this.options.hourHeight / 4;
            this.container = $(container);
            this.render();
            this.modelEl = this.container.find('.agendaGrid-model');
            this.activeEl = this.container.find('.agendaGrid-model-active');
            this.resizeEl = this.container.find('.agendaGrid-model-resize');
            this.currentEl = this.container.find('.agendaGrid-hour-current');
            this.setTitle(this.options.title);
            this.setCurrent();
            this.bindEvents();
        }
        Agenda.prototype.render = function () {
            var hours = new Array(24).join("<div class=\"agendaGrid-hour\">\n            <div class=\"agendaGrid-hour-label\"></div>\n            <div class=\"agendaGrid-hour-line\"></div>\n        </div>");
            var html = "<div class=\"agendaGrid\">\n    <div class=\"agendaGrid-hours\">\n        <div class=\"agendaGrid-hour-current\">\n            <div class=\"agendaGrid-hour-label\"><span></span></div>\n            <div class=\"agendaGrid-hour-line\"></div>\n        </div>\n        " + hours + "\n    </div>\n    <div class=\"agendaGrid-model\">\n        <div class=\"agendaGrid-model-active\">\n            <div class=\"agendaGrid-model-content\">\n                <div class=\"agendaGrid-model-title\"></div>\n                <div class=\"agendaGrid-model-text\"></div>\n            </div>\n            <div class=\"agendaGrid-model-resize\"></div>\n        </div>\n    </div>\n</div>";
            this.container.html(html);
        };
        Agenda.prototype.bindEvents = function () {
            var _this = this;
            this.container.on('mousedown', '.agendaGrid-model-active', function (e) {
                if ($(e.target).closest('.agendaGrid-model-resize').length > 0)
                    return;
                _this.dragStart = true;
                _this.dragStartPos = _this.modelEl.offset().top + e.pageY - _this.activeEl.offset().top;
            });
            this.container.on('mousedown', '.agendaGrid-model-resize', function (e) {
                _this.resizeStart = true;
                _this.resizeStartPos = _this.activeEl.offset().top;
                _this.dragStartPos = _this.resizeEl.height() - e.offsetY;
            });
            this.container.on('mousedown', '.agendaGrid-model', function (e) {
                if ($(e.target).closest('.agendaGrid-model-resize, .agendaGrid-model-active').length > 0)
                    return;
                _this.drawStart = true;
                _this.drawStartPos = e.offsetY;
                _this.dragStartPos = e.pageY;
                _this.activeEl.css({
                    top: _this.getGridSnap(_this.drawStartPos),
                    height: _this.getGridSnap(_this.options.hourHeight / 2)
                });
            });
            $(document).on('mouseup', function () {
                _this.dragStart = false;
                _this.resizeStart = false;
                _this.drawStart = false;
                _this.dragStartPos = 0;
                _this.resizeStartPos = 0;
                _this.drawStartPos = -1;
                var startTime = _this.getStartTime();
                var endTime = _this.getEndTime();
                _this.options.onTimePick && _this.options.onTimePick(startTime, endTime);
                _this.setText(startTime, endTime);
            });
            $(document).on('mousemove', function (e) {
                if (_this.dragStart && _this.dragStartPos) {
                    _this.drag(_this.getGridSnap(e.pageY - _this.dragStartPos));
                }
                if (_this.resizeStart && _this.resizeStartPos) {
                    _this.resize(_this.getGridSnap(e.pageY - _this.resizeStartPos + _this.dragStartPos));
                }
                if (_this.drawStart && _this.drawStartPos > 0) {
                    _this.activeEl.css('height', _this.getGridSnap(e.pageY - _this.dragStartPos));
                }
            });
        };
        Agenda.prototype.getGridSnap = function (coord) {
            coord = Math.max(this.gridSize * 2, coord);
            coord = Math.round(coord / 12) * 12;
            return coord;
        };
        Agenda.prototype.getTimeFromCoord = function (coord) {
            var hours = Math.floor(coord / this.options.hourHeight);
            var minutes = (coord / this.options.hourHeight - hours) * 60;
            return [hours, minutes];
        };
        Agenda.prototype.setText = function (start, end) {
            var s = start.map(function (n) { return n.toFixed(0); }).map(zeroPad).join(':');
            var m = end.map(function (n) { return n.toFixed(0); }).map(zeroPad).join(':');
            var text = [s, m].join(' - ');
            this.activeEl.find('.agendaGrid-model-text').html(text);
        };
        Agenda.prototype.setCurrent = function () {
            var curDate = new Date();
            var curH = curDate.getHours();
            var curM = curDate.getMinutes();
            this.currentEl.css({ top: this.getCoordFromTime(curH, curM) });
            this.currentEl.find('.agendaGrid-hour-label span').html([curH, curM].map(function (n) { return n.toString(); }).map(zeroPad).join(':'));
        };
        Agenda.prototype.drag = function (coords) {
            this.activeEl.css('top', coords);
        };
        Agenda.prototype.resize = function (height) {
            this.activeEl.css('height', height);
        };
        Agenda.prototype.getStartTime = function () {
            var top = this.activeEl.position().top - this.gridSize * 2;
            return this.getTimeFromCoord(top);
        };
        Agenda.prototype.getEndTime = function () {
            var bottom = this.activeEl.position().top - this.gridSize * 2 + this.activeEl.height();
            return this.getTimeFromCoord(bottom);
        };
        Agenda.prototype.getCoordFromTime = function (hour, min) {
            return hour * this.options.hourHeight + Math.round(min / 60 * this.options.hourHeight);
        };
        Agenda.prototype.setTitle = function (title) {
            this.activeEl.find('.agendaGrid-model-title').html(title);
        };
        Agenda.prototype.setStartTime = function (hours, min) {
            this.drag(this.getCoordFromTime(hours, min) + this.gridSize * 2);
            this.setText([hours, min], this.getEndTime());
        };
        Agenda.prototype.setEndTime = function (hours, min) {
            this.resize(this.getCoordFromTime(hours, min) - this.getCoordFromTime.apply(this, this.getStartTime()));
            this.setText(this.getStartTime(), [hours, min]);
        };
        return Agenda;
    }());
    Agenda_1.Agenda = Agenda;
    function zeroPad(num) {
        if (num.length < 2)
            num = "0" + num;
        return num;
    }
})(Agenda || (Agenda = {}));
$.fn.Agenda = function (options) {
    return $(this)['agenda'] = new Agenda.Agenda(this, options);
};
//# sourceMappingURL=agenda.js.map