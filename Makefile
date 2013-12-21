JS_TARGETS    = scripts.js
JS_MINIFIED   = $(JS_TARGETS:.js=.min.js)

CSS_TARGETS   = styles.css
CSS_MINIFIED  = $(CSS_TARGETS:.css=.min.css)

CLOSURE       = closure-compiler
CLOSURE_FLAGS = --compilation_level ADVANCED_OPTIMIZATIONS

all: js css header

clean:
	$(RM) htdocs/header.html $(JS_MINIFIED) $(CSS_MINIFIED)

js: $(JS_MINIFIED)

css: $(CSS_MINIFIED)

header: htdocs/header.html

htdocs/header.html: $(JS_MINIFIED) $(CSS_MINIFIED) header1.html header2.html header3.html
	cat header1.html $(CSS_MINIFIED) header2.html $(JS_MINIFIED) header3.html >$@

%.min.css: %.css
	curl -s -X POST --data-urlencode input@$< http://cssminifier.com/raw > $@

%.min.js: %.js
	$(CLOSURE) $(CLOSURE_FLAGS) --js=$< --js_output_file=$@
