JS_TARGETS    = scripts.js
JS_MINIFIED   = $(addprefix htdocs/resources/,$(JS_TARGETS))

CSS_TARGETS   = styles.css
CSS_MINIFIED  = $(addprefix htdocs/resources/,$(CSS_TARGETS))

CLOSURE       = closure-compiler
CLOSURE_FLAGS = --compilation_level ADVANCED_OPTIMIZATIONS --language_in=ECMASCRIPT5_STRICT

all: js css header

clean:
	$(RM) $(JS_MINIFIED) $(CSS_MINIFIED)

debug:
	cp $(JS_TARGETS) $(JS_MINIFIED)
	cp $(CSS_TARGETS) $(CSS_MINIFIED)
	rsync -r htdocs/ /web/ferretbomb/dev

js: $(JS_MINIFIED)

css: $(CSS_MINIFIED)

header: htdocs/header.html

htdocs/header.html: header1.html header2.html $(CSS_MINIFIED)
	cat header1.html $(CSS_MINIFIED) header2.html > $@

htdocs/resources/%.css: %.css
	curl -s -X POST --data-urlencode input@$< http://cssminifier.com/raw > $@

htdocs/resources/%.js: %.js
	$(CLOSURE) $(CLOSURE_FLAGS) --js=$< --js_output_file=$@
