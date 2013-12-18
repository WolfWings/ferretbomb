// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name scripts-min.js
// ==/ClosureCompiler==

(function(){

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

	return function(url, callback) {
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

,class: {
	has: (function(tag, theClass) { "use strict";
		var re = new RegExp("(?:^|\\s)" + theClass + "(?!\\S)");
		console.log(re);
		return re.test(tag["className"]);
	})
	,add: (function(tag, theClass) { "use strict";
		tag["className"] += " " + theClass;
	})
	,remove: (function(tag, theClass) { "use strict";
		var re = new RegExp("(?:^|\\s)" + theClass + "(?!\\S)", "g");
		tag["className"] = tag.className.replace(re, "");
	})
	,toggle: (function(tag, theClass) { "use strict";
		console.log(tag.className, theClass);
		if ($.class.has(tag, theClass)) {
			$.class.remove(tag, theClass);
		} else {
			$.class.add(tag, theClass);
		}
	})
}

,"events": {
	"add": (function(object, event, callback){ "use strict";
		if (object.attachEvent) {
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

,"inits": {
	"article": (function() { "use strict";
		var header = $.tags.find.tagname('header')[0];
		var outline = $.tags.create('div');
		outline.setAttribute('id', 'outline');
		header.appendChild(outline);
		var outlineToggleExpanded = (function(event){ "use strict";
			var tag = event.toElement;
			while (tag && !/^[Ll][Ii]$/.test(tag.tagName)) {
				tag = tag.parentNode;
			}
			if ($.class.has(tag, "leaf")) {
				return true;
			}
			$.class.toggle(tag, "expanded");
			return true;
		});
		$.events.add(outline, "click", outlineToggleExpanded);
		$.reoutline("content", "outline");
	})
}

};

setTimeout($.checkstream, 0);

}());
