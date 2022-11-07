const fs = require('fs');
require.extensions['.glsl'] = (m, fileName) => {
  return m._compile(
    `module.exports=\`${fs.readFileSync(fileName)}\``,
    fileName
  );
};
