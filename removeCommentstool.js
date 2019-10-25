const strip = require('strip-comments');
var fs = require('fs');

function pollingFolder(path) {
	fs.readdir(path, (err, files) => {
		if (err) {
			console.log(err);
		}else {
			files.forEach((item) => {
				console.log(item);
				let filePath = path + '\\' + item;//get file's absolute path
				fs.stat(filePath,(error, stats) => {
					if (error){
                        console.warn('获取文件stats失败');
                    } else{
                        let isFile = stats.isFile();//是文件
                        let isDir = stats.isDirectory();//是文件夹
                        if (isFile){
							deleteNotes(item, filePath);
                        }
                        if (isDir){
                            pollingFolder(filePath);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                        }
                    }
				})
			})
		}
	});
}

function deleteNotes(item, filePath) {
	if (item.indexOf('.js') !== -1 || item.indexOf('.ts') !== -1 || item.indexOf('.css') !== -1 || item.indexOf('.scss') !== -1) {
        let f = fs.readFileSync(filePath).toString();
        const result = strip(f);
		// const reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n|$))|(\/\*([\s\S]*?)\*\/)/g;
		// var result = f.replace(reg, function(s) { 
		// 	return /^\/{2,}/.test(s) || /^\/\*/.test(s) ? "" : s; 
		// });
		fs.writeFileSync(filePath, result, 'utf8');//将删除了注释的文件重新写入
	} if (item.indexOf('.html') !== -1) {
		let f = fs.readFileSync(filePath).toString();
		const reg = /\s*<!--.*?-->/sg;
		var result = f.replace(reg, '');
		fs.writeFileSync(filePath, result, 'utf8');//将删除了注释的文件重新写入
	}
}
pollingFolder(String.raw`${process.argv[2]}`);