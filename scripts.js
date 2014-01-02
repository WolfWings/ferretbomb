(function(){ "use strict";

window["$"] = {

API_URL: (function(prefix, suffix){ "use strict";
	return "https://api.twitch.tv/kraken/" + prefix + "/ferretbomb" + suffix;
})

,streamonline: false
,updatestreamonline: (function(status){ "use strict";
	$.streamonline = status;
})

,streampreview: undefined
,updatestreampreview: (function(preview){ "use strict";
	$.streampreview = preview;
})

,JSONP: (function(){ "use strict";
	var counter = 0;

	var memoryleakcap = function() {
		if (this.readyState && this.readyState !== 'loaded' && this.readyState !== 'complete') {
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

		$.tags_append_child($.tags_find_tagname('head')[0], script);

		return uniqueName;
	};
}())

,reoutline: (function(content, outline) { "use strict";
	var headings = '';
	var depth = 0;
	var lastAnchor = undefined;
	for (var tag = $.tags_find_id(content).firstChild;
	     tag;
	     tag = tag.nextSibling) {
		if (/^[aA]$/.test(tag.nodeName) && ($.tags_attribute_get(tag, 'name').length > 1)) {
			lastAnchor = $.tags_attribute_get(tag, 'name');
			continue;
		}
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
		if (lastAnchor === undefined) {
			headings += tag.innerHTML;
		} else {
			headings += '<a href="#' + lastAnchor + '">' + tag.innerHTML + '</a>';
			lastAnchor = undefined;
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
	$.tags_find_id(outline).innerHTML = headings.join('<li');
})

,updatebanner: (function() { "use strict";
	$.JSONP($.API_URL('channels', ''), function(response) {
		if ($.streampreview === undefined) {
			$.updatestreampreview(response['video_banner']);
		}
	});
})

,checkstream: (function() { "use strict";
	$.JSONP($.API_URL('streams', ''), function(response) {
		if (response['stream'] === null) {
			setTimeout($.updatebanner, 0);
			setTimeout($.checkstream, 60000);
			$.updatestreamonline(false);
			return;
		}
		$.updatestreamonline(true);
		$.updatestreampreview(response['stream']['preview']['large']);
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
,tags_find_tagname: (function(tagname){ "use strict";
	return document['getElementsByTagName'](tagname);
})
,tags_find_id: (function(id){ "use strict";
	return document['getElementById'](id);
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

,"init": {
	"article": (function() { "use strict";
		var header = $.tags_find_tagname('header')[0];
		var outline = $.tags_create('div');
		$.tags_attribute_set(outline, 'id', 'outline');
		$.tags_append_child(header, outline);
		var tail = $.tags_create('div');
		$.tags_attribute_set(tail, 'id', 'tail');
		$.tags_append_child(header, tail);
		var outlineToggleExpanded = (function(event){ "use strict";
			var tags = document['querySelectorAll']('.expanded');
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
		});
		$.events_add(outline, 'click', outlineToggleExpanded);
		$.reoutline('content', 'outline');
	})

	,"stream": (function() { "use strict";
		var stream = $.tags_find_tagname('stream')[0];
		var embed = $.tags_create('object');
		var attribs = {
			'type': 'application/x-shockwave-flash'
			,'height': '100%'
			,'width': '100%'
			,'id': 'live_embed_player_flash'
			,'data': 'http://www.twitch.tv/widgets/live_embed_player.swf?channel=ferretbomb'
			,'bgcolor': '#000000'
		};
		for (var attrib in attribs) {
			$.tags_attribute_set(embed, attrib, attribs[attrib]);
		}
		var params = {
			'allowFullScreen': 'true'
			,'allowScriptAccess': 'true'
			,'allowNetworking': 'all'
			,'movie': 'http://www.twitch.tv/widgets/live_embed_player.swf'
			,'flashvars': 'hostname=www.twitch.tv&channel=ferretbomb&auto_play=true&start_volume=100'
		};
		for (var param in params) {
			var tag = $.tags_create('param');
			$.tags_attribute_set(tag, 'name', param);
			$.tags_attribute_set(tag, 'value', params[param]);
			$.tags_append_child(embed, tag);
		}
		$.tags_append_child(stream, embed);
	})
}

};

setTimeout($.checkstream, 0);

}());
