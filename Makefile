JS_TARGETS    = scripts.js
JS_MINIFIED   = $(addsuffix .min,$(addprefix htdocs/,$(JS_TARGETS)))

CSS_TARGETS   = styles.css
CSS_MINIFIED  = $(addsuffix .min,$(addprefix htdocs/,$(CSS_TARGETS)))

CLOSURE       = closure-compiler
CLOSURE_FLAGS = --compilation_level ADVANCED_OPTIMIZATIONS --language_in=ECMASCRIPT5_STRICT

all: js css

clean:
	$(RM) $(JS_MINIFIED) $(CSS_MINIFIED)

js: $(JS_MINIFIED)

css: $(CSS_MINIFIED)

%.css.min: ../%.css
	curl -s -X POST --data-urlencode input@$< http://cssminifier.com/raw > $@

%.js.min: ../%.js
	$(CLOSURE) $(CLOSURE_FLAGS) --js=$< --js_output_file=$@
