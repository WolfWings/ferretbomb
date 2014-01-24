ferretbomb
==========

Website framework code for Ferretbomb's twitch.tv channel

Build Requirements
==================

- CSSO (Node.js based, available via NPM)
- Closure-compiler (Java based)
- Web-server configured to apply header.html/footer.html before/after all .html responses.

Deployment
==========

git pull
make
rsync -r htdocs/ <documentRoot>
