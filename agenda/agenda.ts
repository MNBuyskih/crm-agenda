module Agenda {
    export class Agenda {
        private gridSize;
        private container: JQuery;
        private modelEl: JQuery;
        private activeEl: JQuery;
        private resizeEl: JQuery;
        private currentEl: JQuery;
        private dragStart: boolean;
        private resizeStart: boolean;
        private drawStart: boolean;
        private dragStartPos: number;
        private drawStartPos: number;
        private resizeStartPos: number;

        constructor(container: JQuery, private options: IAgendaOptions) {
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

        private render() {
            let hours = new Array(24).join(`<div class="agendaGrid-hour">
            <div class="agendaGrid-hour-label"></div>
            <div class="agendaGrid-hour-line"></div>
        </div>`);
            let html = `<div class="agendaGrid">
    <div class="agendaGrid-hours">
        <div class="agendaGrid-hour-current">
            <div class="agendaGrid-hour-label"><span></span></div>
            <div class="agendaGrid-hour-line"></div>
        </div>
        ${hours}
    </div>
    <div class="agendaGrid-model">
        <div class="agendaGrid-model-active">
            <div class="agendaGrid-model-content">
                <div class="agendaGrid-model-title"></div>
                <div class="agendaGrid-model-text"></div>
            </div>
            <div class="agendaGrid-model-resize"></div>
        </div>
    </div>
</div>`;
            this.container.html(html);
        }

        private bindEvents() {
            this.container.on('mousedown', '.agendaGrid-model-active', (e) => {
                if ($(e.target).closest('.agendaGrid-model-resize').length > 0) return;
                this.dragStart = true;
                this.dragStartPos = this.modelEl.offset().top + e.pageY - this.activeEl.offset().top;
            });
            this.container.on('mousedown', '.agendaGrid-model-resize', (e) => {
                this.resizeStart = true;
                this.resizeStartPos = this.activeEl.offset().top;
                this.dragStartPos = this.resizeEl.height() - e.offsetY;
            });
            this.container.on('mousedown', '.agendaGrid-model', (e) => {
                if ($(e.target).closest('.agendaGrid-model-resize, .agendaGrid-model-active').length > 0) return;
                this.drawStart = true;
                this.drawStartPos = e.offsetY;
                this.dragStartPos = e.pageY;

                this.activeEl.css({
                    top: this.getGridSnap(this.drawStartPos),
                    height: this.getGridSnap(this.options.hourHeight / 2)
                });
            });
            $(document).on('mouseup', () => {
                this.dragStart = false;
                this.resizeStart = false;
                this.drawStart = false;

                this.dragStartPos = 0;
                this.resizeStartPos = 0;
                this.drawStartPos = -1;

                let startTime = this.getStartTime();
                let endTime = this.getEndTime();
                this.options.onTimePick && this.options.onTimePick(startTime, endTime);
                this.setText(startTime, endTime);
            });
            $(document).on('mousemove', (e) => {
                if (this.dragStart && this.dragStartPos) {
                    this.drag(this.getGridSnap(e.pageY - this.dragStartPos));
                }
                if (this.resizeStart && this.resizeStartPos) {
                    this.resize(this.getGridSnap(e.pageY - this.resizeStartPos + this.dragStartPos));
                }
                if (this.drawStart && this.drawStartPos > 0) {
                    this.activeEl.css('height', this.getGridSnap(e.pageY - this.dragStartPos));
                }
            });
        }

        private getGridSnap(coord: number): number {
            coord = Math.max(this.gridSize * 2, coord);
            coord = Math.round(coord / 12) * 12;
            return coord;
        }

        private getTimeFromCoord(coord: number): number[] {
            let hours = Math.floor(coord / this.options.hourHeight);
            let minutes = (coord / this.options.hourHeight - hours) * 60;
            return [hours, minutes];
        }

        private setText(start: number[], end: number[]): void {
            var s = start.map((n) => n.toFixed(0)).map(zeroPad).join(':');
            var m = end.map((n) => n.toFixed(0)).map(zeroPad).join(':');
            let text = [s, m].join(' - ');
            this.activeEl.find('.agendaGrid-model-text').html(text);
        }

        private setCurrent(): void {
            let curDate = new Date();
            let curH = curDate.getHours();
            let curM = curDate.getMinutes();
            this.currentEl.css({top: this.getCoordFromTime(curH, curM)});
            this.currentEl.find('.agendaGrid-hour-label span').html([curH, curM].map((n) => n.toString()).map(zeroPad).join(':'));
        }

        private drag(coords: number): void {
            this.activeEl.css('top', coords);
        }

        private resize(height: number): void {
            this.activeEl.css('height', height);
        }

        getStartTime(): number[] {
            let top = this.activeEl.position().top - this.gridSize * 2;
            return this.getTimeFromCoord(top);
        }

        getEndTime(): number[] {
            let bottom = this.activeEl.position().top - this.gridSize * 2 + this.activeEl.height();
            return this.getTimeFromCoord(bottom);
        }

        getCoordFromTime(hour: number, min: number): number {
            return hour * this.options.hourHeight + Math.round(min / 60 * this.options.hourHeight);
        }

        setTitle(title: string): void {
            this.activeEl.find('.agendaGrid-model-title').html(title);
        }

        setStartTime(hours: number, min: number): void {
            this.drag(this.getCoordFromTime(hours, min) + this.gridSize * 2);
            this.setText([hours, min], this.getEndTime());
        }

        setEndTime(hours: number, min: number): void {
            this.resize(this.getCoordFromTime(hours, min) - this.getCoordFromTime.apply(this, this.getStartTime()));
            this.setText(this.getStartTime(), [hours, min]);
        }
    }

    export interface IAgendaOptions {
        hourHeight: number;
        onTimePick?: (start: number[], end: number[]) => void;
        title: string;
    }

    function zeroPad(num: string): string {
        if (num.length < 2) num = "0" + num;
        return num;
    }
}

$.fn.Agenda = function (options) {
    return $(this)['agenda'] = new Agenda.Agenda(this, options);
};