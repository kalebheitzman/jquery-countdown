# jQuery Countdown

[View the demo][demo]

jQuery Countdown is a plugin that allows you to easily create as many countdowns on your website as you would like. You can setup a countdown schedule by passing it in options or you can specify a data-countdown attribute to the div your calling jQuery Countdown on.

## Installation

Drop jquery.countdown.js into your scripts folder. Drop jquery.countdown.css into your styles folder if you wish. Really you should just create your own styles. I've included jquery.countdown.css for reference.

## Usage

Simple: Use the .countdown() method on a div with a data-countdown attribute.

````
<div id="countdown" data-countdown="January 01, 2020 15:00:00"></div>
````

````
$('#countdown').countdown();
````

Advanced: Use the .countdown() method on a div and pass a repeating schedule of events.

````
<div id="countdown"></div>
```

````
$('#countdown').countdown({
	schedule: { 
		"Wednesday": [ "17:00:00", "17:50:00" ],
		"Friday": [ "12:00:00" ]
	}
});
````

## Working with dates

If you use the data-countdown attribute, your date format must be ````mmmm, dd, yyyy hh:mm:ss````, ex: ````January 01, 2020 15:00:00````.


[demo]: http://kheitzman.com/projects/jquery-countdown  "jQuery Countdown"