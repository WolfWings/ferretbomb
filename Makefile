JS_TARGETS   = scripts.js
JS_MINIFIED  = $(addprefix htdocs/resources/,$(JS_TARGETS))

CSS_TARGETS  = styles.css
CSS_MINIFIED = $(addprefix htdocs/resources/,$(CSS_TARGETS))

JS           = closure-compiler
JS_FLAGS     = --compilation_level ADVANCED_OPTIMIZATIONS --language_in=ECMASCRIPT5_STRICT

CSS          = csso
CSS_FLAGS    = 

all: js css header

clean:
	$(RM) $(JS_MINIFIED) $(CSS_MINIFIED)

debug: js css header
	rsync -r htdocs/ /web/ferretbomb/dev

js: $(JS_MINIFIED)

css: $(CSS_MINIFIED)

header: htdocs/header.html

htdocs/header.html: header1.html header2.html $(CSS_MINIFIED)
	cat header1.html $(CSS_MINIFIED) header2.html > $@

htdocs/resources/%.css: %.css
	$(CSS) $(CSS_FLAGS) -i $< -o $@

htdocs/resources/%.js: %.js
	$(JS) $(JS_FLAGS) --js=$< --js_output_file=$@
