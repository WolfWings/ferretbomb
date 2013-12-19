#!/bin/bash
curl -s \
	-d compilation_level=ADVANCED_OPTIMIZATIONS \
	-d output_info=compiled_code \
	-d output_format=text \
	--data-urlencode "js_code@scripts.js.src" \
	http://closure-compiler.appspot.com/compile \
	-o htdocs/scripts.js

curl -s \
	-X POST \
	--data-urlencode "input@styles.css.src" \
	http://cssminifier.com/raw \
	-o htdocs/styles.css
