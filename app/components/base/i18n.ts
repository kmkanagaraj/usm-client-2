declare function require(name: string);

/* tslint:disable */
var moment = require("moment");
var sprintf = require("sprintf-js").sprintf;
/* tslint:enable */

export class I18N {
    private gettextCatalog: any;
    public getPlural: any;
    public numberFilter: any;
    public currentLanguage: string;
    public sprintf: any;
    constructor(gettextCatalog, numberFilter) {
        this.gettextCatalog = gettextCatalog;
        this.getPlural = gettextCatalog.getPlural;
        this.currentLanguage = gettextCatalog.currentLanguage;
        this.numberFilter = numberFilter;
        this.sprintf = sprintf;
    }

    public _(s) {
        return this.gettextCatalog.getString(s);
    }

    public N_(s) {
        return s;
    }

    public hasTranslation() {
        return this.gettextCatalog.strings[this.currentLanguage] != undefined;
    }

    public getDateTime(timestamp) {
        if (timestamp == undefined)
            return timestamp;
        var date = new Date(timestamp);
        var isValidDate = function(date) {
            if (Object.prototype.toString.call(date) !== '[object Date]')
                return false;
            return !isNaN(date.getTime());
        }
        if (!isValidDate(date)) {
            return timestamp;
        }
        var options = { year: "numeric", month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit", second: "2-digit",
                        timeZoneName: "short" };
        return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
    }

    public setDateTimePickerTranslation() {
        // TRANSLATORS: Refer meridiem in https://github.com/moment/moment/blob/develop/locale/$lang.js
        var am = this._('am');
        var AM = this._('AM');
        var pm = this._('pm');
        var PM = this._('PM');

        // Extract the translatable strings for angular-bootstrap-datetimepicker
        // becase moment language.js needs the static link with browserify:
        // https://github.com/moment/moment/issues/2007
        var lang = moment.defineLocale(this.currentLanguage, {
            // TRANSLATORS: Refer monthShort in https://github.com/moment/moment/blob/develop/locale/$lang.js
            monthsShort : this._('Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec').split('_'),
            // TRANSLATORS: Refer weekdaysMin in https://github.com/moment/moment/blob/develop/locale/$lang.js
            weekdaysMin : this._('Su_Mo_Tu_We_Th_Fr_Sa').split('_'),
            // TRANSLATORS: Refer meridiemParse in https://github.com/moment/moment/blob/develop/locale/$lang.js
            meridiemParse: this._('/[ap]\.?m?\.?/i'),
            isPM : function (input) {
                return input.toLowerCase() === PM.toLowerCase();
            },
            longDateFormat : {
                // TRANSLATORS: Refer LT in https://github.com/moment/moment/blob/develop/locale/$lang.js
                LT : this._('h:mm A'),
                // TRANSLATORS: Refer LL in https://github.com/moment/moment/blob/develop/locale/$lang.js
                LL: this._('MMMM D, YYYY'),
                // TRANSLATORS: Refer LLL in https://github.com/moment/moment/blob/develop/locale/$lang.js
                LLL: this._('MMMM D, YYYY h:mm A')
            },
            meridiem : function (hours, minute, isLower) {
                if (hours > 11) {
                    return isLower ? pm : PM;
                }
                else {
                    return isLower ? am : AM;
                }

            }
        });
        moment.locale(this.currentLanguage);
    }
}
