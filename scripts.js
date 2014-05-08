(function(){ "use strict";

window['$'] = {

'_': (function(oauth, state) {
	if (state === localStorage.getItem('connect_secret')) {
		localStorage.removeItem('connect_secret');
		localStorage.setItem('twitch_oauth', oauth);
	}
})

,API_URL: (function(prefix, suffix){
	return 'https://api.twitch.tv/kraken/' + prefix + '/ferretbomb' + suffix;
})

/* Functions reformatted to allow more compact representations by Closure Compiler.
 *
 * Yes, it's UGLY as sin to any normal coder. Saves quite a bit of space. =O.o=
 */

,classes_match: (function(theClass){
	return new RegExp('(?:^|\\s)' + theClass + '(?!\\S)', 'g');
})
,classes_has: (function(tag, theClass) {
	return $.classes_match(theClass).test(tag['className']);
})
,classes_add: (function(tag, theClass) {
	tag['className'] += ' ' + theClass;
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
	if (object['attachEvent']) {
		object['attachEvent']('on' + event, callback);
	} else {
		object['addEventListener'](event, callback, false);
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
,tags_append_child: (function(parent, child){
	parent['appendChild'](child);
})

,JSON: (function(url, callback){
	var xhr = (function(){
		try { return new XMLHttpRequest(); } catch(ignore) {}
		try { return new ActiveXObject('Mxsml2.XMLHTTP'); } catch(ignore) {}
		return null;
	}());
	xhr.open('GET', url, true);
	xhr.onreadystatechange = (function(){
		if (this.readyState !== 4) { return; }
		callback(JSON.parse(this.responseText));
	});
	xhr.send(null);
})

,JSONP: (function(){
	var counter = 0;

	var memoryleakcap = function() {
		if (this.readyState !== 'loaded' && this.readyState !== 'complete') {
			return;
		}

		try {
			this.onload = this.onreadystatechange = null;
			this.parentNode.removeChild(this);
		} catch(ignore) {}
	};

	return function(url, callback) {
		var uniqueName = 'callback_json' + (++counter);

		window[ uniqueName ] = function(data){
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

,banner_init: (function(){
	$.JSON('/resources/banners/', (function(banners){
		var banner = banners[Math.floor(Math.random() * banners.length)];
		$.tags_find('#banner')[0]['style']['backgroundImage'] =
			'url(/resources/banners/' + banner + ')';
	}));
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
			$.JSONP('https://api.twitch.tv/kraken?oauth_token=' + data['access_token'], (function(reply) {
				if (reply['token']['valid'] === true) {
					window.parent['$']['_'](data['access_token'], data['state']);
				}
				window.close();
			}));
		} else {
			window.close();
		}
	})

	,'stream': (function() {
		$.classes_remove($.tags_find('#onair')[0], 'pulsing');

		(function() {
			var chat = $.tags_find('#chat')[0];
			var tag = $.tags_create('iframe');
			tag.id = 'chat_embed';
			tag.frameborder = 0;
			tag.scrolling = 'no';
			tag.width = '100%';
			tag.height = '100%';
			tag.src = 'http://www.twitch.tv/ferretbomb/chat';
			$.tags_append_child(chat, tag);
		})();

		(function() {
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
		})();

		(function() {
			var bricks = $.tags_find('.brick');
			var infopanels = $.tags_find('.infopanels')[0];

			$.events_add(window, 'resize', (function() {
				var oldcolumns = $.tags_find('.column');
				var total = Math.floor(infopanels['scrollWidth'] / bricks[0]['scrollWidth']);

				/* Skip old-column logic if there aren't any columns. */
				if (oldcolumns.length > 0) {
					/* Skip re-flow if not needed. */
					if (oldcolumns.length === total) {
						return;
					}
					/* First move all the bricks out of their columns. */
					for (var i = 0; i < bricks.length; i++) {
						$.tags_append_child(infopanels, bricks[i]);
					}
					/* Now delete all the columns to avoid leaking memory. */
					for (var i = 0; i < oldcolumns.length; i++) {
						oldcolumns[i].parentNode.removeChild(oldcolumns[i]);
					}
				}

				/* If there isn't at least 2 columns, nothing to do! */
				if (total < 2) {
					return;
				}

				/* First, create all the columns needed. */
				var columns = new Array(total);
				for (var i = 0; i < total; i++) {
					columns[i] = $.tags_create('div');
					$.classes_add(columns[i], 'column');
					$.tags_append_child(infopanels, columns[i]);
				}

				/* Flow mechanic is simple: Append each brick to vertically-shortest column. */
				for (var i = 0; i < bricks.length; i++) {
					var column = 0;
					var height = columns[column].scrollHeight;
					for (var j = 1; j < columns.length; j++) {
						if (columns[j]['scrollHeight'] < height) {
							height = columns[j]['scrollHeight'];
							column = j;
						}
					}

					$.tags_append_child(columns[column], bricks[i]);
				}
			}))();
		})();

		(function() {
			var connect_button_image = $.tags_create('img');
			connect_button_image.src = 'http://ttv-api.s3.amazonaws.com/assets/connect_dark.png';
			var connect_button = $.tags_create('a');
			$.tags_append_child(connect_button, connect_button_image);
			connect_button.href = 'javascript:void(0)';
			connect_button.id = 'connectTwitch';
			$.classes_add(connect_button, 'hidden');
			$.tags_append_child($.tags_find('header')[0], connect_button);
			$.events_add(connect_button, 'click', function(){
				localStorage.setItem('connect_secret', Math.floor((1+Math.random())*0x19A100).toString(36).substring(1));
				window.open('https://api.twitch.tv/kraken/oauth2/authorize?response_type=token&redirect_uri=http://dev.ferretbomb.wolfwings.us/callback.html&scope=channel_check_subscription&client_id=3em0oguw6wyn8h22m6z0y9wd8156884&state=' + localStorage.getItem('connect_secret'), 'twitchAuth', 'width=976,height=600,modal=yes,alwaysRaised=yes');
//				window.open('https://api.twitch.tv/kraken/oauth2/authorize?response_type=token&redirect_uri=http://www.ferretbomb.com/callback.html&scope=channel_check_subscription&client_id=9hexi86zpth36z0u4zzqt8feorfanrt&state=' + localStorage.getItem('connect_secret'), 'twitchAuth', 'width=976,height=600,modal=yes,alwaysRaised=yes');
			});

			var voting_update = function() {
				$.JSONP('/votes.php', function(response) {
					/* Test if the oauth cookie exists, to hide the 'connect' button if so. */
					if (localStorage.getItem('twitch_oauth') === null) {
						$.classes_remove($.tags_find('#connectTwitch')[0], 'hidden');
					} else {
						$.classes_add($.tags_find('#connectTwitch')[0], 'hidden');
					}

					console.log(response);

					if (response.hasOwnProperty('rapid') &&
					    response['rapid'] === true) {
						setTimeout(voting_update, 5000);
					} else {
						setTimeout(voting_update, 60000);
					}
				});
			};
			setTimeout(voting_update, 0);
		})();
	})
}

};

setTimeout($.checkstream, 0);

$.banner_init();

$.inits[init]();

}());
