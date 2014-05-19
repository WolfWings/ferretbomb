// Development Use
/** @const */ var twitch_client_id = '3em0oguw6wyn8h22m6z0y9wd8156884';
/** @const */ var twitch_redirect  = 'http://dev.ferretbomb.wolfwings.us/callback.html';

// Production Use
// /** @const */ var twitch_client_id = '9hexi86zpth36z0u4zzqt8feorfanrt';
// /** @const */ var twitch_redirect  = 'http://www.ferretbomb.com/callback.html';

(function(){ "use strict";

/* 'Callback' trigger for OAuth logins. */
window['$'] = {

API_URL: (function(prefix, suffix){
	return 'https://api.twitch.tv/kraken/' + prefix + '/ferretbomb' + suffix;
})

,'oauth': (function(oauth, state) {
	if (state === localStorage['getItem']('twitch_secret')) {
		localStorage['removeItem']('twitch_secret');
		localStorage['setItem']('twitch_oauth', oauth);
	}
})

,URL: (function(base, parameters){
	var URI = base.toString();
	var packaged = [];
	for (var param in parameters) { if (parameters['hasOwnProperty'](param)) {
		packaged.push(param + '=' + parameters[param].toString());
	} }
	if (packaged.length > 0) {
		URI = URI + "?" + packaged.join('&');
	}
	return URI;
})

/* Functions reformatted to allow more compact representations by Closure Compiler.
 *
 * Yes, it's UGLY as sin to any normal coder, but saves quite a bit of space! =O.o=
 */

,classes_match: (function(theClass){
	return new RegExp('(?:^|\\s)' + theClass + '(?!\\S)', 'g');
})
,classes_has: (function(tag, theClass) {
	return $.classes_match(theClass).test(tag['className']);
})
,classes_add: (function(tag, theClass) {
	if (!($.classes_has(tag, theClass))) {
		tag['className'] += ' ' + theClass;
	}
	return tag;
})
,classes_remove: (function(tag, theClass) {
	tag['className'] = tag['className'].replace($.classes_match(theClass), '');
	return tag;
})
,classes_toggle: (function(tag, theClass) {
	if ($.classes_has(tag, theClass)) {
		$.classes_remove(tag, theClass);
	} else {
		$.classes_add(tag, theClass);
	}
	return tag;
})

,events_add: (function(object, event, callback){
	if (object['addEventListener']) {
		object['addEventListener'](event, callback, true);
	} else {
		object['attachEvent']('on' + event, callback);
	}
	return callback;
})

,tags_create: (function(tagname){
	return document['createElement'](tagname);
})
,tags_find: (function(selector){
	return document['querySelectorAll'](selector);
})
,tags_attribute_has: (function(tag, attribute){
	return tag['hasAttribute'](attribute);
})
,tags_attribute_get: (function(tag, attribute){
	return tag['getAttribute'](attribute);
})
,tags_attribute_set: (function(tag, attribute, value){
	tag['setAttribute'](attribute, value);
})
,tags_append_child: (function(parent, child, before){
	parent['insertBefore'](child, before);
})

,JSON: (function(url, callback, post_params){
	var xhr = new XMLHttpRequest();
	xhr['open']((post_params === undefined) ? 'GET' : 'POST', url, true);
	if (post_params !== undefined) {
		xhr['setRequestHeader']('Content-Type', 'application/x-www-form-urlencoded');
	}
	xhr['onreadystatechange'] = (function(){
		if (this['readyState'] !== 4) { return; }
		callback(JSON['parse'](this['responseText']));
	});
	if (post_params === undefined) {
		xhr.send();
	} else {
		xhr.send(post_params.join('&'));
	}
	xhr = null;
})

,JSONP: (function(){
	var counter = 0;

	var memoryleakcap = function() {
		if ((this.readyState !== 'loaded')
		 && (this.readyState !== 'complete')) {
			return;
		}

		try {
			this.onload = this.onreadystatechange = null;
			this.parentNode.removeChild(this);
		} catch(ignore) {}
	};

	return function(url, callback) {
		var uniqueName = 'callback_json' + (++counter);

		window[uniqueName] = function(data){
			callback(data);
			window[uniqueName] = null;
			try {
				delete window[uniqueName];
			} catch (ignore) {}
		};

		var script = $.tags_create('script');
		script.src = url + (url.toString().indexOf('?') === -1 ? '?' : '&') + 'callback=' + uniqueName;
		script.async = true;

		script.onload = script.onreadystatechange = memoryleakcap;

		$.tags_append_child($.tags_find('head')[0], script);

		return uniqueName;
	};
}())

,checkstream: (function() {
	$.JSONP($.API_URL('streams', ''), function(response) {
		var tag = $.tags_find('#onair')[0];
		var operation = $.classes_remove;
		var delay = 60000;
		var title = 'Live every night, starting at\nroughly 2200 PST/0600 GMT';

		if (response['stream'] !== null) {
			operation = $.classes_add;
			delay = 600000;
			title = response['stream']['channel']['status']
			      + '\n' + response['stream']['channel']['game'];
		}

		setTimeout($.checkstream, delay);
		$.tags_attribute_set(tag, 'title', title);
		operation(tag, 'online');
	});
})

,cachebuster: (function() {
	return (new Date().getTime()).toString(36);
})

,banner_init: (function(){
	$.JSON('/resources/banners/', (function(banners){
		var banner = banners[Math.floor(Math.random() * banners.length)];
		$.tags_find('#banner')[0]['style']['backgroundImage'] =
			'url(/resources/banners/' + banner + ')';
	}));
})

,infobricklayer: (function() {
	var bricks = $.tags_find('.brick');
	var infopanels = $.tags_find('.infopanels')[0];

	setTimeout($.events_add(window, 'resize', (function() {
		var oldcolumns = $.tags_find('.column');
		var columns = [];
		var total = Math.floor(infopanels['scrollWidth'] / bricks[0]['scrollWidth']);

		/* Skip re-flow if not needed. */
		if (oldcolumns.length === total) {
			return;
		}

		/* Skip old-column logic if there aren't any columns. */
		if (oldcolumns.length > 0) {
			/* Move all the bricks out of their old columns. */
			for (var i = 0; i < bricks.length; i++) {
				$.tags_append_child(infopanels, bricks[i]);
			}

			/* Convert NodeList into Array. */
			for (var i = 0; i < oldcolumns.length; i++) {
				columns.push(oldcolumns[i]);
			}

			/* Delete excess columns. */
			while (columns.length > total) {
				var i = columns.pop();
				i.parentNode.removeChild(i);
			}
		}

		/* If there isn't at least 2 columns, nothing to do! */
		if (total < 2) {
			return;
		}

		/* Create additional columns if/as needed. */
		while (columns.length < total) {
			var i = $.tags_create('div');
			$.classes_add(i, 'column');
			$.tags_append_child(infopanels, i);
			columns.push(i);
		}

		/* Append each brick to vertically-shortest column. */
		for (var i = 0; i < bricks.length; i++) {
			var column = 0;
			var height = columns[0].scrollHeight;
			for (var j = 1; j < columns.length; j++) {
				if (columns[j]['scrollHeight'] < height) {
					height = columns[j]['scrollHeight'];
					column = j;
				}
			}

			$.tags_append_child(columns[column], bricks[i]);
		}
	})), 0);
})

,voting_form_init: (function() {
	var voting_choices = $.tags_create('ul');
	voting_choices.id = 'choices';

	$.tags_append_child(voting_choices, $.tags_create('lh'));

	var reorg = [];
	for (var i = 0; i < 36; i++) {
		var j = Math.floor(Math.random() * (i + 1));
		if (i !== j) {
			reorg[i] = reorg[j];
		}
		reorg[j] = i;
	}

	for (var i = 0; i < 36; i++) {
		var bit = reorg[i].toString(36);
		var li = $.tags_create('li');
		li.id = 'choice_' + bit;
		$.classes_add(li, 'hidden');

		var input = $.tags_create('input');
		input.name = 'voting';
		input.id = 'vote_' + bit;
		input.type = 'checkbox';
		$.tags_append_child(li, input);

		var label = $.tags_create('label');
		label.id = 'label_' + bit;
		label.htmlFor = 'vote_' + bit;
		$.tags_append_child(li, label);

		$.tags_append_child(voting_choices, li);
	}

	var voting_form = $.tags_create('form');
	voting_form.id = 'voting';
	voting_form.maxchoices = undefined;
	$.tags_append_child(voting_form, voting_choices);

	$.tags_append_child($.tags_find('header')[0], voting_form /* , $.tags_find('#tail')[0] */ );

	setTimeout($.voting_form_update, 0);
})

,voting_form_update: (function(oneshot) {
	$.JSON('/voting/tally.php?' + $.cachebuster(), function(response) {
		if (oneshot !== true) {
			if (response.hasOwnProperty('rapid') &&
			    response['rapid'] === true) {
				setTimeout($.voting_form_update, 5000);
			} else {
				setTimeout($.voting_form_update, 60000);
			}
		}

		if (response.hasOwnProperty('title')) {
			$.tags_find('#voting ul lh')[0].innerHTML = response['title'];
		}

		var voting_button_type = 'checkbox';
		if (response.hasOwnProperty('maxchoices')) {
			$.tags_find('#voting')[0].maxchoices = response['maxchoices'];
			if (response['maxchoices'] === 0) {
				voting_button_type = 'radio';
			}
		}

		for (var i = (response.hasOwnProperty('choices') ? response['choices'].length : 0); i < 36; i++) {
			$.classes_add($.tags_find('#choice_' + i.toString(36))[0], 'hidden');
			var input = $.tags_find('#vote_' + i.toString(36))[0];
			input['checked'] = false;
			input['disabled'] = true;
			input['type'] = voting_button_type;
		}

		if (!response.hasOwnProperty('choices')) {
			return;
		}

		var min = response['choices'][0]['votes'];
		var max = min;
		for (var i = 0; i < response['choices'].length; i++) {
			$.tags_find('#label_' + i.toString(36))[0]['innerHTML'] = response['choices'][i]['title'];
			var input = $.tags_find('#vote_' + i.toString(36))[0];
			input['value'] = response['choices'][i]['box'];
			input['disabled'] = false;
			input['type'] = voting_button_type;
			min = (response['choices'][i]['votes'] < min) ? response['choices'][i]['votes'] : min;
			max = (response['choices'][i]['votes'] > max) ? response['choices'][i]['votes'] : max;
		}

		var offsets = [];
		if ((max > min)
		 && response.hasOwnProperty('ballots')
		 && (response['ballots'] > 0)) {
			for (var i = 0; i < response['choices'].length; i++) {
				var per = (((response['choices'][i]['votes'] - min) * 80) / (max - min));
				var tot = ((response['choices'][i]['votes'] * 80) / response['ballots']);
				offsets[i] = Math.floor(per + tot) - 160;
			}
		} else {
			for (var i = 0; i < response['choices'].length; i++) {
				offsets[i] = -160;
			}
		}
		for (var i = 0; i < response['choices'].length; i++) {
			var choice = $.tags_find('#choice_' + i.toString(36))[0];
			choice['style']['backgroundPosition'] = '' + offsets[i] + 'px 1px,' + offsets[i] + 'px 1px';
			$.classes_remove(choice, 'hidden');
		}
	});
})

,voting_buttons_init: (function() {
	var connect_button = $.tags_create('a');
	connect_button.href = 'javascript:void(0)';
	connect_button.id = 'connectTwitch';
	$.classes_add(connect_button, 'hidden');
	$.events_add(connect_button, 'click', function(){
		localStorage['setItem']('twitch_secret', Math.floor((1+Math.random())*0x19A100).toString(36).substring(1));
		var popup = window.open($.URL('https://api.twitch.tv/kraken/oauth2/authorize',
			{'response_type': 'token'
			,'scope':         'user_subscriptions'
			,'redirect_uri':  twitch_redirect
			,'client_id':     twitch_client_id
			,'state':         localStorage['getItem']('twitch_secret')
			})
		,	'LoginWithTwitchTV'
		,	['width=660'
			,'height=600'
			,'modal=yes'
			,'alwaysRaised=yes'
			,'resizable=yes'
			,'status=yes'
			].join(',')
		);
		var test_window_closed = (function() {
			if (popup && popup.closed) {
				$.voting_buttons_update();
				return;
			}
			setTimeout(test_window_closed, 500);
		});
		test_window_closed();
	});
	$.tags_append_child($.tags_find('header')[0], connect_button /* , $.tags_find('#tail')[0] */ );

	var voting_button = $.tags_create('button');
	voting_button['id'] = 'castvote';
	voting_button['type'] = 'button';
	voting_button['disabled'] = true;
	voting_button['innerHTML'] = 'Cast Vote';
	voting_button['title'] = 'Initializing... please wait!';
	$.classes_add(voting_button, 'hidden');
	$.events_add(voting_button, 'click', $.voting_buttons_castvote);
	$.tags_append_child($.tags_find('header')[0], voting_button /* , $.tags_find('#tail')[0] */ );

	$.voting_buttons_update();
})

,voting_buttons_update: (function() {
	var castvote = $.tags_find('#castvote')[0];
	var connectTwitch = $.tags_find('#connectTwitch')[0];

	/* Commonly triggered case, hoisted out into it's own sub-function. */
	var oauth_invalid = (function() {
		localStorage['removeItem']('twitch_oauth');
		castvote['disabled'] = true;
		castvote['title'] = 'No "Connect w/ Twitch" credentials available.';
		$.classes_add(castvote, 'hidden');
		$.classes_remove(connectTwitch, 'hidden');
	});

	/* No OAuth token? 'Connect with Twitch' and done. */
	if (localStorage['getItem']('twitch_oauth') === null) {
		oauth_invalid();
		return;
	}

	/*
	 * Now we need to verify if the OAuth token is valid.
	 *
	 * First, ping Twitch first. Two reasons:
	 *   1) If they say it's invalid, once we re-auth we'll wipe our server's OAuth immediately.
	 *   2) Only if Twitch says it's valid, THEN we poke our server which will either:
	 *      a) Have the right one cached and return immediately.
	 *      b) Update it's internal status, including pulling the subscriber info a'new.
	 *
	 * So this sequence avoids as much load as possible on things, and is needed because
	 * we're checking w/ Twitch directly to avoid hitting the cached OAuth hash we store
	 * on our own database for rapid vote handling.
	 */
	$.JSONP($.URL('https://api.twitch.tv/kraken'
	             , {'oauth_token':localStorage['getItem']('twitch_oauth')})
	       , (function(response) {
		if ((!response['hasOwnProperty']('token'))
		 || (!response['token']['hasOwnProperty']('valid'))
		 || (response['token']['valid'] !== true)) {
			/* Nope, invalid. WIPE! */
			oauth_invalid();
			return;
		}

		/* Yay, valid OAuth token, now to update our site! */
		$.classes_add(connectTwitch, 'hidden');
		castvote['disabled'] = true;
		$.JSON('/voting/votedyet.php?oauth=' + localStorage['getItem']('twitch_oauth') + '&cachebuster=' + $.cachebuster(), function(response) {

			if ((response['hasOwnProperty']('invalid_oauth'))
			 && (response['invalid_oauth'] === true)) {
				/* Nope, invalid. WIPE! */
				oauth_invalid();
				return;
			}

			if ((response['hasOwnProperty']('user_voted'))
			 && (response['user_voted'] === true)) {
				$.classes_add(castvote, 'hidden');
				castvote['disabled'] = true;
				castvote['title'] = 'You have already voted in this poll!';
				return;
			}

			castvote['title'] = 'Click here to cast your vote!';
			castvote['disabled'] = false;
			$.classes_remove(castvote, 'hidden');

		});
	}));
})

,voting_buttons_castvote: (function() {
	if ($.classes_has(this, 'processing')
	 || ($.tags_find('#voting')[0].maxchoices === undefined)) {
		event['stopPropegation']();
		return;
	}
	var votes = [];
	for (var i = 0; i < 36; i++) {
		var input = $.tags_find('#vote_' + i.toString(36))[0];
		if (input['checked']) {
			input['checked'] = false;
			votes.push('votes=' + input['value']);
		}
	}
	if (votes.length < 1) {
		// No items selected
		return;
	}
	if (votes.length > (1 + $.tags_find('#voting')[0].maxchoices)) {
		// Too many items selected
		return;
	}
	$.classes_add(this, 'processing');
	votes.push('oauth=' + localStorage['getItem']('twitch_oauth'));
	votes.push('cachebuster=' + $.cachebuster());
	$.JSON('/voting/cast.php', (function(response) {

		$.classes_remove($.tags_find('#castvote')[0], 'processing');
		setTimeout($.voting_buttons_update, 0);
		$.voting_form_update(true);

		if ((response['hasOwnProperty']('not_subscriber'))
		 && (response['not_subscriber'] === true)) {
			$.classes_remove($.tags_find('#error_not_subscriber')[0], 'hidden');
			return;
		}

	}), votes);
})

,inits: {
	'article': (function() {
		var header = $.tags_find('header')[0];
		var outline = $.tags_create('div');
		$.tags_attribute_set(outline, 'id', 'outline');
		$.tags_append_child(header, outline);
		$.events_add(outline, 'click', (function(event){
			for (var tag = event.toElement;
			     tag && $.tags_attribute_get(tag, 'id') !== 'outline';
			     tag = tag.parentNode) {
				if ($.classes_has(tag, 'leaf')
				 || $.classes_has(tag, 'expanded')) {
					return true;
				}
			}
			var tags = $.tags_find('.expanded');
			for (var tag = 0;
			     tag < tags['length'];
			     tag++) {
				$.classes_remove(tags[tag], 'expanded');
			};
			for (var tag = event.toElement;
			     tag && $.tags_attribute_get(tag, 'id') !== 'outline';
			     tag = tag.parentNode) {
				$.classes_add(tag, 'expanded');
			}
			event['stopPropegation']();
			return false;
		}));

		(function(outline) {
			var headings = '';
			var depth = 0;
			for (var tag = $.tags_find('#content')[0].firstChild;
			     tag;
			     tag = tag.nextSibling) {
				var isheader = /^[Hh]([1-6])$/.exec(tag.nodeName);
				if (isheader === null) {
					continue;
				}
				var newdepth = parseInt(isheader[1], 10);
				if (depth === newdepth) {
					headings += '</li><li>';
				} else {
					headings += new Array(Math.abs(depth - newdepth) + 1).join((depth < newdepth) ? '<ol><li>' : '</li></ol></li><li>');
					depth = newdepth;
				}
				if ($.tags_attribute_has(tag, 'id')) {
					headings += '<a href="#' + $.tags_attribute_get(tag, 'id') + '">' + tag.innerHTML + '</a>';
				} else {
					headings += tag.innerHTML;
				}
			}
			headings += new Array(depth + 1).join('</li></ol>');
			headings = headings.split('<ol');
			for (var index = 1;
			     index < headings.length;
			     index++) {
				if (headings[index].indexOf('</ol>') !== -1) {
					headings[index] = ' class="leaf"' + headings[index];
				}
			}
			headings = headings.join('<ol').split('<li');
			for (var index = 1;
			     index < headings.length;
			     index++) {
				if (headings[index].indexOf('<ol') === -1) {
					headings[index] = ' class="leaf"' + headings[index];
				}
			}
			outline.innerHTML = headings.join('<li');
		})(outline);
	})

	,'twitter': (function() {
		var script = $.tags_create('script');
		script['id'] = 'twitter-wjs';
		script['src'] = '//platform.twitter.com/widgets.js';
		script['async'] = true;
		$.tags_append_child($.tags_find('head')[0], script);
	})

	,'callback': (function() {
		var items = document['location']['hash'].split('#')[1].split('&');
		var data = {};
		for (var i = 0; i < items.length; i++) {
			items[i] = items[i].split('=');
			data[items[i][0]] = items[i][1];
		}
		if ((data['access_token'])
		 && (data['state'])) {
			$.JSONP($.URL('https://api.twitch.tv/kraken',{'oauth_token':data['access_token']}), (function(reply) {
				if (reply['token']['valid'] === true) {
					window.parent['$']['oauth'](data['access_token'], data['state']);
				}
				window.close();
			}));
		} else {
			window.close();
		}
	})

	,'stream': (function() {
		$.classes_remove($.tags_find('#onair')[0], 'pulsing');

		setTimeout(function() {
			var chat = $.tags_find('#chat')[0];
			var tag = $.tags_create('iframe');
			tag.id = 'chat_embed';
			tag.frameborder = 0;
			tag.scrolling = 'no';
			tag.width = '100%';
			tag.height = '100%';
			tag.src = 'http://www.twitch.tv/ferretbomb/chat';
			$.tags_append_child(chat, tag);
		}, 0);

		setTimeout(function() {
			var stream = $.tags_find('#stream')[0];
			var embed = $.tags_create('object');
			var attribs = {
				'type': 'application/x-shockwave-flash'
				,'wmode': 'opaque'
				,'width': '100%'
				,'height': '100%'
				,'id': 'stream_embed'
				,'bgcolor': '#000'
				,'data': 'http://www.twitch.tv/widgets/live_embed_player.swf?channel=ferretbomb'
			};
			for (var attrib in attribs) {
				$.tags_attribute_set(embed, attrib, attribs[attrib]);
			}
			var params = {
				'allowFullScreen': 'true'
				,'allowScriptAccess': 'true'
				,'allowNetworking': 'true'
				,'wmode': 'opaque'
				,'movie': 'http://www.twitch.tv/widgets/live_embed_player.swf'
				,'flashvars': 'hostname=www.twitch.tv&channel=ferretbomb&auto_play=true&start_volume=50'
			};
			for (var param in params) {
				var tag = $.tags_create('param');
				$.tags_attribute_set(tag, 'name', param);
				$.tags_attribute_set(tag, 'value', params[param]);
				$.tags_append_child(embed, tag);
			}
			$.tags_append_child(stream, embed);
		}, 0);

		$.infobricklayer();

		/*
		 * There's several things in motion here;
		 *
		 *   1) Build a button to be able to 'Connect w/ Twitch'
		 *      a) Uses popup w/ callback-to-parent construct
		 *      b) Stores data in localStorage, not cookies
		 *      c) Uses per-attempt 'state' parameter as well
		 *	 2) Build the poll item storage w/ randomized order
		 *      a) Uses 'inside out' Fisher-Yates shuffle
		 *      b) Items are shuffled via client-side layout
		 *      c) Shuffle is calculated once per page-load
		 *   3) Build a button to allow for votes to be cast
		 *      a) Only show after server recognizes OAuth
		 *      b) Disable if server sees a vote already
		 *      c) Trigger #4 when vote successfully cast
		 *   4) Setup periodic poll query to verify poll status
		 *      a) By default, every 60 seconds
		 *      b) Polling system active? Every 5 seconds
		 *      c) Blind rewrites labels/input-type
		 *      d) Percentage bars are background-images.
		 *
		 * Keeping these things orderly w/ the multiple interlocking
		 * components is a bit delicate as it relies on external and
		 * untrusted sources.  Using localStorage instead of cookies 
		 * is to avoid cluttering the client/server traffic, we only
		 * send the OAuth string when verifying voting accessibility
		 * and when actually casting a vote.
		 *
		 * The OAuth string is only kept server-side for a short bit
		 * of time to allow caching requests without hitting Twitch,
		 * and flushed to force re-checking Twitch periodically.
		 */

		$.voting_form_init();
		$.voting_buttons_init();
	})
}

};

setTimeout($.checkstream, 0);

$.banner_init();

$.inits[init]();

}());
