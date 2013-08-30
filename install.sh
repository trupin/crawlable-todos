#! /bin/sh

cd public
rm -rf bower_components
../node_modules/bower/bin/bower --allow-root install

cd bower_components

curl -L https://github.com/trupin/crawlable/archive/1.0.0.tar.gz | tar -zxf -
mv crawlable-1.0.0 crawlable

curl -L https://github.com/trupin/solidify/archive/1.0.0.tar.gz | tar -zxf -
mv solidify-1.0.0 solidify
