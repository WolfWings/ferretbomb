(function(){ "use strict";

window["$"] = {

streamonline: false
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
		if (this.readyState && this.readyState !== "loaded" && this.readyState !== "complete") {
			return;
		}

		try {
			this.onload = this.onreadystatechange = null;
			this.parentNode.removeChild(this);
		} catch(ignore) {}
	};

	return function(url, callback) { "use strict";
		var uniqueName = 'callback_json' + (++counter);

		var script = $.tags.create('script');
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

		$.tags.find.tagname('head')[0].appendChild(script);

		return uniqueName;
	};
}())

,reoutline: (function(content, outline) { "use strict";
	var headings = "";
	var depth = 0;
	var lastAnchor = undefined;
	for (var tag = $.tags.find.id(content).firstChild; tag; tag = tag.nextSibling) {
		if (/^[aA]$/.test(tag.nodeName) && (tag.getAttribute("name").length > 1)) {
			lastAnchor = tag.getAttribute("name");
			continue;
		}
		var isheader = /^[Hh]([1-6])$/.exec(tag.nodeName);
		if (isheader === null) {
			continue;
		}
		var newdepth = parseInt(isheader[1], 10);
		if (depth === newdepth) {
			headings += "</li><li>";
		} else {
			headings += new Array(Math.abs(depth - newdepth) + 1).join((depth < newdepth) ? "<ol><li>" : "</li></ol></li><li>");
			depth = newdepth;
		}
		if (lastAnchor === undefined) {
			headings += tag.innerHTML;
		} else {
			headings += "<a href=\"#" + lastAnchor + "\">" + tag.innerHTML + "</a>";
			lastAnchor = undefined;
		}
	}
	headings += new Array(depth + 1).join("</li></ol>");
	headings = headings.split("<ol");
	for (var index = 1; index < headings.length; index++) {
		if (headings[index].indexOf("</ol>") !== -1) {
			headings[index] = " class=\"leaf\"" + headings[index];
		}
	}
	headings = headings.join("<ol").split("<li");
	for (var index = 1; index < headings.length; index++) {
		if (headings[index].indexOf("<ol") === -1) {
			headings[index] = " class=\"leaf\"" + headings[index];
		}
	}
	$.tags.find.id(outline).innerHTML = headings.join("<li");
})

,updatebanner: (function() { "use strict";
	$.JSONP("https://api.twitch.tv/kraken/channels/ferretbomb", function(response) {
		if ($.streampreview === undefined) {
			$.updatestreampreview(response["video_banner"]);
		}
	});
})

,checkstream: (function() { "use strict";
	$.JSONP("https://api.twitch.tv/kraken/streams/ferretbomb", function(response) {
		if (response["stream"] === null) {
			setTimeout($.updatebanner, 0);
			setTimeout($.checkstream, 60000);
			$.updatestreamonline(false);
			return;
		}
		$.updatestreamonline(true);
		$.updatestreampreview(response["stream"]["preview"]["large"]);
		setTimeout($.checkstream, 600000);
		return;
	});
})

,classes: {
	match: (function(theClass){ "use strict";
		return new RegExp("(?:^|\\s)" + theClass + "(?!\\S)", "g");
	})
	,has: (function(tag, theClass) { "use strict";
		return $.classes.match(theClass).test(tag["className"]);
	})
	,add: (function(tag, theClass) { "use strict";
		tag["className"] += " " + theClass;
		return tag;
	})
	,remove: (function(tag, theClass) { "use strict";
		tag["className"] = tag["className"].replace($.classes.match(theClass), "");
		return tag;
	})
	,toggle: (function(tag, theClass) { "use strict";
		if ($.classes.has(tag, theClass)) {
			$.classes.remove(tag, theClass);
		} else {
			$.classes.add(tag, theClass);
		}
		return tag;
	})
}

,events: {
	add: (function(object, event, callback){ "use strict";
		if (object["attachEvent"]) {
			object["attachEvent"]("on" + event, callback);
		} else {
			object["addEventListener"](event, callback, false);
		}
		return object;
	})
}

,tags: {
	create: (function(tagname){ "use strict";
		return document["createElement"](tagname);
	})
	,find: {
		tagname: (function(tagname){ "use strict";
			return document["getElementsByTagName"](tagname);
		})
		,id: (function(id){ "use strict";
			return document["getElementById"](id);
		})
	}
}

,"init": {
	"article": (function() { "use strict";
		var header = $.tags.find.tagname('header')[0];
		var outline = $.tags.create('div');
		outline.setAttribute('id', 'outline');
		header.appendChild(outline);
		var tail = $.tags.create('div');
		tail.setAttribute('id', 'tail');
		header.appendChild(tail);
		var outlineToggleExpanded = (function(event){ "use strict";
			var tag = event.toElement;
			while (tag && !/^[Ll][Ii]$/.test(tag.tagName)) {
				tag = tag.parentNode;
			}
			if ($.classes.has(tag, "leaf")) {
				return true;
			}
			$.classes.toggle(tag, "expanded");
			return true;
		});
		$.events.add(outline, "click", outlineToggleExpanded);
		$.reoutline("content", "outline");
	})

	,"stream": (function() { "use strict";
		var stream = $.tags.find.tagname('stream')[0];
		var embed = $.tags.create('object');
		var attribs = {
			'type': 'application/x-shockwave-flash'
			,'height': '100%'
			,'width': '100%'
			,'id': 'live_embed_player_flash'
			,'data': 'http://www.twitch.tv/widgets/live_embed_player.swf?channel=ferretbomb'
			,'bgcolor': '#000000'
		};
		var params = {
			'allowFullScreen': 'true'
			,'allowScriptAccess': 'true'
			,'allowNetworking': 'all'
			,'movie': 'http://www.twitch.tv/widgets/live_embed_player.sfw'
			,'flashvars': 'hostname=www.twitch.tv&channel=ferretbomb&auto_play=true&start_volume=100'
		};
		for (var attrib in attribs) {
			embed.setAttribute(attrib, attribs[attrib]);
		}
		for (var param in params) {
			var tag = $.tags.create('param');
			tag.setAttribute('name', param);
			tag.setAttribute('value', params[param]);
			embed.appendChild(tag);
		}
		stream.appendChild(embed);
	})
}

};

setTimeout($.checkstream, 0);

}());
