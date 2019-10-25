const fs = require('fs');
const readline = require('readline');

async function deleteNotes(filePath) {
  const f = await fs.readFileSync(filePath, 'utf-8').toString();
  const reg = /((\+|-)(\s)*?(\/{2,}.*?)(\r|\n))|(\/{2,}.*?(\r|\n))|((http|https).*?(\r|\n))|((\+|-)(\s)*?\/\*([\s\S]*?)(\*\/|@@))|(\/\*([\s\S]*?)(\*\/|@@))|((\r|\n)(\s)*(\*|\*\/)([\s\S]*?)(\r|\n))/g;
  const regResult = await f.replace(reg, (s) => {
    if (/^(\r|\n)/.test(s)) {
      return '';
    }
    if (/@@$/.test(s)) {
      return '@@';
    }
    if (/^(\+|-)/.test(s) || /^\/\*/.test(s)) {
      return '';
    }
    if (/^(\/{2,})/.test(s)) {
      return '\n';
    }
    return s;
  });
  fs.writeFileSync(`${filePath}_inter`, regResult, 'utf-8');
  const result = fs.createWriteStream(`${filePath}_final`);
  const objReadline = readline.createInterface({
    input: fs.createReadStream(`${filePath}_inter`)
  });
  const reg1 = /^[\s]*$/;
  const reg2 = /(^$)/;
  objReadline.on('line', (input) => {
    if (!reg1.test(input)) {
      result.write(`${input}\n`, 'utf-8');
    }
  });
  objReadline.on('close', () => {
    fs.unlink(`${filePath}_inter`, () => {});
    // fs.exists(`${filePath}1`, (isExists) => {
    //   if (isExists) {
    //     fs.rename(`${filePath}1`, filePath, () => {});
    //   }
    // });
  });
}

function recursionFolder(path) {
  fs.stat(path, (e, stat) => {
    if (e) {
      console.log('wrong path!');
    } else if (stat.isFile()) {
      deleteNotes(path);
    }
  });
}

function getParameter(args) {
  const path = String.raw`${args[2]}`;
  recursionFolder(path);
}

getParameter(process.argv);