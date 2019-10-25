const fs = require('fs');
const readline = require('readline');

async function deleteNotes(mode, filePath) {
  if (filePath.indexOf('.js') !== -1 || filePath.indexOf('.ts') !== -1 || filePath.indexOf('.css') !== -1 || filePath.indexOf('.scss') !== -1) {
    const f = fs.readFileSync(filePath).toString();
    const reg = /("([^\\"]*(\\.)?)*")|('([^\\']*(\\.)?)*')|(`([^\\`]*(\\.)?)*`)|(\/{2,}.*?(\r|\n|$))|(\/\*([\s\S]*?)\*\/)/g;
    const regResult = await f.replace(reg, (s) => {
      if (s.indexOf('eslint') !== -1 || s.indexOf('global') !== -1) {
        return s;
      }
      if (/^\/{2,}.*\n/.test(s)) {
        if (mode === 'dryrun') {
          console.log(`filePath: ${filePath} + ${s}`);
          return s;
        }
        return '\n';
      }
      if (/^\/{2,}/.test(s) || /^\/\*/.test(s)) {
        if (mode === 'dryrun') {
          console.log(`filePath: ${filePath} + ${s}`);
          return s;
        }
        return '';
      }
      return s;
    });
    if (mode !== 'dryrun') {
      fs.writeFileSync(filePath, regResult, 'utf8');
      const result = fs.createWriteStream(`${filePath}1`);
      const objReadline = readline.createInterface({
        input: fs.createReadStream(filePath)
      });
      const reg1 = /^[\s]*$/;
      const reg2 = /(^$)/;
      objReadline.on('line', (input) => {
        if (!reg1.test(input) || reg2.test(input)) {
          result.write(`${input}\n`, 'utf8');
        }
      });
      objReadline.on('close', () => {
        fs.unlink(filePath, () => {});
        fs.exists(`${filePath}1`, (isExists) => {
          if (isExists) {
            fs.rename(`${filePath}1`, filePath, () => {});
          }
        });
      });
    }
  } else if (filePath.indexOf('.html') !== -1) {
    const f = fs.readFileSync(filePath).toString();
    const reg = /\s*<!--.*?-->/sg;
    const result = await f.replace(reg, (s) => {
      if (mode === 'dryrun') {
        console.log(`filePath: ${filePath} + ${s}`);
        return s;
      }
      return '';
    });
    fs.writeFileSync(filePath, result, 'utf8');
  }
}

function recursionFolder(mode, path) {
  fs.stat(path, (e, stat) => {
    if (e) {
      console.log('wrong path!');
    } else if (stat.isFile()) {
      if (path.indexOf('.js') !== -1 || path.indexOf('.ts') !== -1 || path.indexOf('.css') !== -1 || path.indexOf('.scss') !== -1 || path.indexOf('.html') !== -1) {
        deleteNotes(mode, path);
      }
    } else if (stat.isDirectory()) {
      fs.readdir(path, (err, files) => {
        if (err) {
          console.log(err);
        } else {
          files.forEach((item) => {
            console.log(item);
            const filePath = `${path}\\${item}`;// get file's absolute path
            fs.stat(filePath, (error, stats) => {
              if (error) {
                console.log(error);
              } else {
                const isFile = stats.isFile();
                const isDir = stats.isDirectory();
                if (isFile) {
                  if (item.indexOf('.js') !== -1 || item.indexOf('.ts') !== -1 || item.indexOf('.css') !== -1 || item.indexOf('.scss') !== -1 || item.indexOf('.html') !== -1) {
                    deleteNotes(mode, filePath);
                  }
                } else if (isDir) {
                  recursionFolder(mode, filePath);
                }
              }
            });
          });
        }
      });
    }
  });
}

function getParameter(args) {
  const mode = args[2];
  let paths;
  if (args.length > 3) {
    paths = args.slice(3);
  }
  paths.forEach((value) => {
    const path = String.raw`${value}`;
    recursionFolder(mode, path);
  });
}

getParameter(process.argv);
