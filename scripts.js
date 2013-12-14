// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name scripts-min.js
// ==/ClosureCompiler==

(function(){

window["$"] = {

JSONP: (function(){ 'use strict';
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

		var script = document.createElement('script');
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

		document.getElementsByTagName('head')[0].appendChild(script);

		return uniqueName;
	};
}())

,reoutline: (function(content, outline) { "use strict";
	var headings = "";
	var depth = 0;
	var lastAnchor = undefined;
	for (var tag = document.getElementById(content).firstChild; tag; tag = tag.nextSibling) {
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
	document.getElementById(outline).innerHTML = headings.join("<li");
})

};

}());

window["init"] = (function() { "use strict";

document.getElementById("outline").addEventListener("click", (function(event){ "use strict";
	var tag = event.toElement;
	while (tag && !/^[Ll][Ii]$/.test(tag.tagName)) {
		tag = tag.parentNode;
	}
	if (tag.className.match(/(?:^|\s)leaf(?!\S)/)) {
		return true;
	}
	if (tag.className.match(/(?:^|\s)expanded(?!\S)/)) {
		tag.className = tag.className.replace( /(?:^|\s)expanded(?!\S)/g , '' );
	} else {
		tag.className += " expanded";
	}
	return true;
}), false);

window["$"].reoutline("content", "outline");

window["$"].JSONP("https://api.twitch.tv/kraken/streams/ferretbomb", function(response) {
        console.log(response["streams"]);
});

});
