(function(){ "use strict";

window["$"] = {

API_URL: (function(prefix, suffix){ "use strict";
	return "https://api.twitch.tv/kraken/" + prefix + "/ferretbomb" + suffix;
})

,updatestreamonline: (function(status){ "use strict";
	var operation = $.classes_remove;
	if (status) {
		operation = $.classes_add;
	}
	var tag = $.tags_find('#onair')[0];
	operation(tag, 'online');
})

,JSON: (function(url, callback){ "use strict";
	var xhr = (function(){
		try { return new XMLHttpRequest(); } catch(ignore) {}
		try { return new ActiveXObject('Mxsml2.XMLHTTP'); } catch(ignore) {}
		return null;
	}());
	xhr.open('GET', url, true);
	xhr.onreadystatechange = (function(){ "use strict";
		if (this.readyState !== 4) { return; }
		callback(JSON.parse(this.responseText));
	});
	xhr.send(null);
})

,JSONP: (function(){ "use strict";
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

	return function(url, callback) { "use strict";
		var uniqueName = 'callback_json' + (++counter);

		var script = $.tags_create('script');
		script.src = url + (url.toString().indexOf('?') === -1 ? '?' : '&') + 'callback=' + uniqueName;
		script.async = true;

		window[ uniqueName ] = function(data){
			callback(data);
			window[uniqueName] = null;
			try {
				delete window[uniqueName];
			} catch (ignore) {}
		};

		script.onload = script.onreadystatechange = memoryleakcap;

		$.tags_append_child($.tags_find('head')[0], script);

		return uniqueName;
	};
}())

,reoutline: (function(content, outline) { "use strict";
	var headings = '';
	var depth = 0;
	for (var tag = $.tags_find("#" + content)[0].firstChild;
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
})

,checkstream: (function() { "use strict";
	$.JSONP($.API_URL('streams', ''), function(response) {
		if (response['stream'] === null) {
			setTimeout($.checkstream, 60000);
			$.updatestreamonline(false);
			return;
		}
		$.updatestreamonline(true);
		setTimeout($.checkstream, 600000);
		return;
	});
})

,classes_match: (function(theClass){ "use strict";
	return new RegExp('(?:^|\\s)' + theClass + '(?!\\S)', 'g');
})
,classes_has: (function(tag, theClass) { "use strict";
	return $.classes_match(theClass).test(tag['className']);
})
,classes_add: (function(tag, theClass) { "use strict";
	tag['className'] += ' ' + theClass;
	return tag;
})
,classes_remove: (function(tag, theClass) { "use strict";
	tag['className'] = tag['className'].replace($.classes_match(theClass), '');
	return tag;
})
,classes_toggle: (function(tag, theClass) { "use strict";
	if ($.classes_has(tag, theClass)) {
		$.classes_remove(tag, theClass);
	} else {
		$.classes_add(tag, theClass);
	}
	return tag;
})

,events_add: (function(object, event, callback){ "use strict";
	if (object['attachEvent']) {
		object['attachEvent']('on' + event, callback);
	} else {
		object['addEventListener'](event, callback, false);
	}
	return object;
})

,tags_create: (function(tagname){ "use strict";
	return document['createElement'](tagname);
})
,tags_find: (function(selector){ "use strict";
	return document['querySelectorAll'](selector);
})
,tags_attribute_has: (function(tag, attribute){ "use strict";
	return tag['hasAttribute'](attribute);
})
,tags_attribute_get: (function(tag, attribute){ "use strict";
	return tag['getAttribute'](attribute);
})
,tags_attribute_set: (function(tag, attribute, value){ "use strict";
	tag['setAttribute'](attribute, value);
})
,tags_append_child: (function(parent, child){ "use strict";
	parent['appendChild'](child);
})

,banner_init: (function(){ "use strict";
	$.JSON('/resources/banners/index.json', (function(banners){
		var banner = banners[Math.floor(Math.random() * banners.length)];
		$.tags_find('#logo')[0]['style']['backgroundImage'] =
			'url(/resources/banners/' + banner + ')';
	}));
})

,"init": {
	"article": (function() { "use strict";
		var header = $.tags_find('header')[0];
		var outline = $.tags_create('div');
		$.tags_attribute_set(outline, 'id', 'outline');
		$.tags_append_child(header, outline);
		$.events_add(outline, 'click', (function(event){ "use strict";
			var tags = $.tags_find('.expanded');
			console.log(tags);
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
			return true;
		}));
		$.reoutline('content', outline);
	})

	,"stream": (function() { "use strict";
		$.classes_remove($.tags_find('#onair')[0], 'enabled');
	})
}

};

setTimeout($.checkstream, 1000);

$.banner_init();

}());
