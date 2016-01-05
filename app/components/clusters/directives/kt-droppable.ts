/// <reference path="../../../../typings/tsd.d.ts" />

export class KTDroppable implements ng.IDirective {
    public restrict = 'A';
    public scope = {
        ktDroppable: '&ktDroppable'
    }
    constructor() {
    }

    public link($scope: ng.IScope, element: JQuery, attributes: ng.IAttributes) {
        var elem = element[0];
        elem.addEventListener('drop', (e) => {
            var data = e.dataTransfer.getData("Text");
            $scope['ktDroppable']({ data: JSON.parse(data) });
        }, false);
        // Event to drag over action on droppable element
        elem.addEventListener('dragover', function(e) {
            e.preventDefault();
        }, false);
        elem.addEventListener('dragenter', (e) => {
        }, false);
        elem.addEventListener('dragenter', (e) => {
        }, false);
    }
}
