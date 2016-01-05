/// <reference path="../../../../typings/tsd.d.ts" />

export class KTDraggable implements ng.IDirective {
    public restrict = 'A';
    public scope = {
        ktDraggable: '&ktDraggable'
    }
    constructor() {
    }

    public link($scope: ng.IScope, element: JQuery, attributes: ng.IAttributes) {
        var elem = element[0];
        elem.draggable = true;
        elem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('Text', JSON.stringify($scope['ktDraggable']()));
        }, false);
    }
}
