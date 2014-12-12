#!/bin/bash

#WORK=$(mktemp -d --tmpdir passwordmaker-XXX)
WORK=/tmp/passwordmaker-S7v
OUTPUT=$(dirname $0)/app/components/passwordmaker/jspasswordmaker.js

#svn checkout svn://svn.code.sf.net/p/passwordmaker/svn/tags/javascript-html/2.5/scripts $WORK/svn

SCRIPTS="aes.js
passwordmaker.js
md4.js
md5.js
md5_v6.js
sha256.js
sha1.js
ripemd160.js
l33t.js
cookie.js
hashutils.js
select.js
bodyShow.js"

cat > $OUTPUT << EOF
var passwordmaker = function() {

EOF

for i in $SCRIPTS ; do
 cat $WORK/svn/$i >> $OUTPUT
done

cat >> $OUTPUT << EOF

}
EOF

uglifyjs $OUTPUT -c \
  --comments /Copyright/ \
  --preamble "/* Minified of PasswordMaker scripts: http://sourceforge.net/p/passwordmaker/svn/HEAD/tree/tags/javascript-html/2.5 */" \
  --output $(echo $OUTPUT | sed s/\.js$/.min.js/g)
