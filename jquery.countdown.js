/**
 * jQuery Countdown
 *
 * Provides a javascript countdown timer based on the data-countdown attribute or by
 * passing a schedule of events via options. It will default to data-countdown if the
 * attribute is present, then the next day in a schedule if you pass one, and
 * then it will fail silently as last result if neither of these are present.
 *
 * @author Kaleb Heitzman <kaleblex@gmail.com>
 * @website http://github.com/kaleblex/jquery-countdown.js
 * @created March 12, 2013
 *
 */
;
(function ($) {

    /**
     * Countdown
     */
    $.fn.countdown = function (options) {
        var default_regional = {
            days: 'Days',
            day: 'Day',
            years: 'Years',
            year: 'Year',
            hours: 'Hours',
            hour: 'Hour',
            minutes: 'Minutes',
            minute: 'Minute',
            seconds: 'Seconds',
            second: 'Second'
        };
        // default options
        defaults = {
            schedule: null,
            datetime: null,
            showYears: false,
            showDays: true,
            showHours: true,
            showMinutes: true,
            showSeconds: true,
            showOnZeroYears: false,
            showOnZeroDays: true,
            showOnZeroHours: true,
            showOnZeroMinutes: true,
            showOnZeroSeconds: true,
            regional: default_regional
        };

        /**
         * Extend the options
         */
        var options = $.extend({
            timerCallback: function (options) {
            },
            initCallback: function (options) {
            },
            zeroCallback: function (options) {
            }
        }, defaults, options);

        /**
         * Check for a specified datetime and use ternary to apply value
         */
        options.datetime = $(this).attr('data-countdown') ? $(this).attr('data-countdown') : null;

        /**
         * Run Countdown on Element
         */
        return this.each(function () {

            /**
             * Calculate Upcoming Day
             *
             * Calculate what the upcoming day is based on a combination of schedules
             * and date-time attribute. If a date-time attribute is used, it should be
             * used first. If a schedule is passed, calculate the date and time based
             * on the schedule
             */
            var upcomingDate = scheduler(options);

            /**
             * Get the element to update
             */
            var element = $(this);

            /**
             * Start the timer
             *
             * The time will update the element every one second.
             */
            var intervalHandle = setInterval(function () {
                // get the timerObject
                var timerObject = makeTimer(upcomingDate, options);
                // set the timerObject in options
                options.timerObject = timerObject;
                // create the HTML
                var timerHtml = htmlParser(timerObject, options);
                /**
                 * Update the HTML for the counter
                 */
                updateElement(element, timerHtml, options);
                /** 
                 * Check for zeroCallback
                 */
                if (timerObject.timeLeft <= 0) {
                    /**
                     * Clear the interval because it's no longer needed
                     */
                    clearInterval(intervalHandle);
                    /**
                     * Call the zeroCallback to see if there is anything to perform.
                     */
                    options.zeroCallback(options);
                }
                /**
                 * call the callback timer
                 */
                else {
                    options.timerCallback(options);
                }
            }, 1000);

        });

        /**
         * An overball callback
         */
        options.initCallback.call(this);

    };

    /**
     * Update the element
     *
     * Updates the html inside of the element that plugin is attached to based on
     * schedule or date-time attr.
     */
    var updateElement = function (element, html, options) {
        // update the html
        $(element).html(html);
    }

    /**
     * Scheduler
     *
     * Returns Human Readable date string based on a combination of scheduel,
     * date-time attr, and current datetime.
     */
    var scheduler = function (options) {

        /**
         * Check for registerd data-countdown attr.
         *
         * If the date-time attr is filled in, skip schedule checking and return
         * the passed data-countdown directly.
         */
        if (options.datetime != null) {
            return options.datetime;
        }

        /**
         * Set a blank array to store date and time sin
         */
        var upcomingDates = [];

        /**
         * Process the schedule
         */
        for (var day in options.schedule) {
            // get the next upcoming date
            var nextDate = nextDayByName(day);
            // get the time foreach each future date and push it to upcomingDates
            for (var time in options.schedule[day]) {
                // create a time string to push onto the upcomingDates array
                var timeString = nextDate + " " + options.schedule[day][time];
                // push the string onto the array
                upcomingDates.push(timeString);
            }
        }

        /**
         * Create the schedule to compare times agains
         */
        schedule = [];
        for (var key in upcomingDates) {
            schedule.push(new Date(upcomingDates[key]));
        }

        /**
         * Create the parsed schedule
         */
        parsedSchedule = [];
        for (var key in schedule) {
            parsedSchedule.push(Date.parse(schedule[key]) / 1000);
        }

        /**
         * Current Time
         */
        var currentTime = new Date(),
                currentTimeParsed = Date.parse(currentTime) / 1000;

        /**
         * Build time differences
         */
        timeDifferences = [];
        for (var key in parsedSchedule) {
            timeDifferences.push(parsedSchedule[key] - currentTimeParsed);
        }

        /**
         * Check for Negative
         */
        timeDifferencesParsed = [];
        for (key in timeDifferences) {
            if (timeDifferences[key] > 0) {
                timeDifferencesParsed.push(timeDifferences[key]);
            }
        }

        /**
         * Get the shortest time and store it in key
         */
        var shortTime = Math.min.apply(null, timeDifferencesParsed);
        for (var prop in timeDifferences) {
            if (shortTime == timeDifferences[prop]) {
                var shortTimeKey = prop;
            }
        }

        /**
         * Get the next scheduled date
         */
        var scheduledDate = upcomingDates[shortTimeKey];

        /** 
         * Return the scheduledDate if it's not blank.
         */
        if (scheduledDate != "") {
            return scheduledDate;
        }

        /** 
         * When all else fails return null
         */
        return null;
    }

    /**
     * Make Timer
     *
     * This is the timing method. This will be called every 1 second to return 
     * the html needed to be placed in $(this.element)
     */
    var makeTimer = function (upcomingDate, options) {

        /**
         * Check for null upcomingDate
         */
        if (upcomingDate == null) {
            return "";
        }

        /**
         * Current Time and Date
         */
        var currentTime = new Date();

        /**
         * Convert Dates
         * 
         * Convert the dates to a time string to calculate differences.
         */
        var endTime = (Date.parse(upcomingDate) / 1000);
        var currentTime = (Date.parse(currentTime) / 1000);

        /**
         * Time Left
         */
        var timeLeft = endTime - currentTime;

        /**
         * Set some vars for use
         */
        var years = 0;
        var days = 0;
        var hours = 0;
        var minutes = 0;
        var seconds = 0;

        /**
         * Intercept on <= 0 and calculate differences based on timeLeft
         */
        if (timeLeft > 0) {
            var years = Math.floor((timeLeft / 31536000));
            var days = Math.floor((timeLeft / 86400));
            var hours = Math.floor((timeLeft - (days * 86400)) / 3600);
            var minutes = Math.floor((timeLeft - (days * 86400) - (hours * 3600)) / 60);
            var seconds = Math.floor((timeLeft - (days * 86400) - (hours * 3600) - (minutes * 60)));
            // adjust days for for more than 1 year
            if (days > 365) {
                days = days % 365;
            }
        }

        // create the Timer Object
        var timerObject = {
            "years": years,
            "days": days,
            "hours": hours,
            "minutes": minutes,
            "seconds": seconds,
            "timeLeft": timeLeft
        };

        // return Timer Object
        return timerObject;
    }

    /**
     * Parses a Timer Object to create html
     */
    var htmlParser = function (timerObject, options, format) {

        /**
         * Adjust for zero
         */
        if (timerObject.years < "10") {
            timerObject.years = "0" + timerObject.years;
        }
        if (timerObject.days < "10") {
            timerObject.days = "0" + timerObject.days;
        }
        if (timerObject.hours < "10") {
            timerObject.hours = "0" + timerObject.hours;
        }
        if (timerObject.minutes < "10") {
            timerObject.minutes = "0" + timerObject.minutes;
        }
        if (timerObject.seconds < "10") {
            timerObject.seconds = "0" + timerObject.seconds;
        }

        /**
         * Counter HTML to be passed back to the element
         */
        var counter_years = '<div class="years"><span class="count">' 
                + timerObject.years + 
                '</span><span class="title">' 
                + ( timerObject.years > 1 ? options.regional.years : options.regional.year ) + 
                '</span></div>';
        var counter_days = '<div class="days"><span class="count">' 
                +  timerObject.days + 
                '</span><span class="title">' 
                + ( timerObject.days > 1 ? options.regional.days : options.regional.day ) + 
                '</span></div>';
        var counter_hours = '<div class="hours"><span class="count">' 
                + timerObject.hours + 
                '</span><span class="title">' 
                + ( timerObject.hours > 1 ? options.regional.hours : options.regional.hour ) + 
                '</span></div>';
        var counter_minutes = '<div class="minutes"><span class="count">' 
                + timerObject.minutes + 
                '</span><span class="title">' 
                + ( timerObject.minutes > 1 ? options.regional.minutes : options.regional.minute ) + 
                '</span></div>';
        var counter_seconds = '<div class="seconds"><span class="count">' 
                + timerObject.seconds + 
                '</span><span class="title">' 
                + ( timerObject.seconds > 1 ? options.regional.seconds : options.regional.second ) + 
                '</span></div>';

        /**
         * Setup string inclusions
         */
        var includeYears = false,
                includeDays = false,
                includeHours = false,
                includeMinutes = false,
                includeSeconds = false;

        /**
         * Options base show logic
         */
        if (options.showYears) {
            includeYears = true;
        }
        if (options.showDays) {
            includeDays = true;
        }
        if (options.showHours) {
            includeHours = true;
        }
        if (options.showMinutes) {
            includeMinutes = true;
        }
        if (options.showSeconds) {
            includeSeconds = true;
        }

        /**
         * Options showOnZero logic
         */
        if ((!options.showOnZeroYears) && (timerObject.years == "00")) {
            includeYears = false;
        }
        if ((!options.showOnZeroDays) && (timerObject.days == "00")) {
            includeDays = false;
        }
        if ((!options.showOnZeroHours) && (timerObject.hours == "00")) {
            includeHours = false;
        }
        if ((!options.showOnZeroMinutes) && (timerObject.minutes == "00")) {
            includeMinutes = false;
        }
        if ((!options.showOnZeroSeconds) && (timerObject.seconds == "00")) {
            includeSeconds = false;
        }

        /** Concatonate string
         */
        var counter_html = "";

        if (includeYears) {
            counter_html += counter_years;
        }
        if (includeDays) {
            counter_html += counter_days;
        }
        if (includeHours) {
            counter_html += counter_hours;
        }
        if (includeMinutes) {
            counter_html += counter_minutes;
        }
        if (includeSeconds) {
            counter_html += counter_seconds;
        }

        /**
         * Return the Counter HTML
         */
        return counter_html;
    }

    /** 
     * Next date via schedule or attribute
     */
    var nextDayByName = function (scheduledDay) {

        /**
         * Date Strings
         *
         * Setup some date string to calculate futures events
         */
        var D = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        /**
         * Get the key for the scheduleDay
         */
        for (var prop in D) {
            if (scheduledDay == D[prop]) {
                var whichNext = prop;
            }
        }

        /**
         * Current Date
         *
         * This is used to figure out the time difference to a 
         * scheduled or data-countdown reference
         */
        var date = new Date();

        /**
         * Time Difference
         *
         * Calcuate the difference between the current date and scheduled date. Once
         * this has been calculated, we'll pass a human readable date back to the 
         * countdown method.
         */
        var dif = date.getDay() - whichNext;
        dif = dif > 0 ? dif = 7 - dif : -dif;

        date.setDate(date.getDate() + dif);
        date.setHours(1);//DST pseudobug correction

        // get the day
        var dd = date.getDate();
        dd < 0 ? dd = '0' + dd : null;

        // get the year
        var yyyy = date.getFullYear();

        // get the month
        var mm = M[date.getMonth()];

        /**
         * Human Readable Date String
         *
         * Set the human readable datestring to be passed back, ex. January 01, 2013
         */
        var nextDatebyDayofWeek = mm + ' ' + dd + ', ' + yyyy;
        return nextDatebyDayofWeek;
    }

}(jQuery));
