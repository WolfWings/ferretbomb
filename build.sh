#!/bin/bash

cp header1.html htdocs/header.html

echo Minifying CSS...

curl -s \
	-X POST \
	--data-urlencode "input@styles.css.src" \
	http://cssminifier.com/raw \
	>> htdocs/header.html

cat header2.html >> htdocs/header.html

echo Minifying JavaScript...

curl -s \
	-d compilation_level=ADVANCED_OPTIMIZATIONS \
	-d output_info=compiled_code \
	-d output_format=text \
	--data-urlencode "js_code@scripts.js.src" \
	http://closure-compiler.appspot.com/compile \
	>> htdocs/header.html

cat header3.html >> htdocs/header.html
