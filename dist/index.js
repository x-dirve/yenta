const { fs, chalk } = require("@tarojs/helper");
const path = require("path");

// NOTE: 
// @tarojs/runtime 在实现 page 的包裹函数时使用了 componentDidCatch ，但没有将捕获的错误信息传递给开发者
// 这导致在业务页面中使用 componentDidCatch 将捕获不到错误信息，导致 sentry 的异常捕获功能异常
// 由于官方不打算修复这个问题，因此提的 pr 没有被合并，暂时只能使用一些非常规的手段处理
// 后续如果官方修复则可在编译配置文件中将该模块去除


// 模块文件名
const MOD_NAME = "[TARO-YENTA]";

// 要处理的目标文件
const TARGET_FILE = "@tarojs/runtime/dist/index.js";

const TARGET_ESM_FILE = "@tarojs/runtime/dist/runtime.esm.js";

console.log(
    chalk.blue(MOD_NAME)
    , chalk.yellow("componentDidCatch 问题强制修复模块启动")
);

// 真正的文件地址
const FilePath = path.resolve(
    process.cwd()
    , "node_modules"
    , ...(TARGET_FILE.split("/"))
);

const EsmFilePath = path.resolve(
    process.cwd()
    , "node_modules"
    , ...(TARGET_ESM_FILE.split("/"))
);

// 文件内容
var runtimeFileStr = fs.readFileSync(
    FilePath
    , "utf8"
);

var esmRuntimeFileStr = fs.readFileSync(
    EsmFilePath
    , "utf8"
);

// 处理标志
const MARK_REGEXP = /@YENTA/;

// 代码块匹配正则
const TARGET_REGEXP = /function\scomponentDidCatch[\s]?\(error\,\sinfo\)\s\{([\W\w]+)\};\s+Page/;

// esm 代码块匹配正则
const ESM_TARGET_REGEXP = /componentDidCatch[\s]?\(error\,\sinfo\)\s\{([\W\w]+)\}\s+render\(\)\s\{\s+const\schildren/;

// pr 中用于修复的代码
const REPLACE_STR = `
                if (isFunction(component.prototype.componentDidCatch)) {
                    let pageInstance = getPageInstance(id);
                    if (pageInstance) {
                        component.prototype.componentDidCatch.call(pageInstance, error, info);
                    } else {
                        component.prototype.componentDidCatch(error, info);
                    }
                } else {
                    console.warn(error);
                    console.error(info.componentStack);
                }
            `;

// 原始内容，没什么卵用，只是做个备份
const ORIGIN_STR = `
                console.warn(error);
                console.error(info.componentStack);
`;

function processor(target, filePath, regexp, fileStr) {
    console.log(
        chalk.blue(MOD_NAME)
        , chalk.yellow("目标文件未处理过，尝试强行替换")
        , chalk.red.underline(`[${target}]`)
        , chalk.yellow("中的内容")
    );
    console.log(
        " ".repeat(MOD_NAME.length)
        , chalk.gray("详情请查看模块内部说明")
    );
    var newRuntimeFileStr = fileStr.replace(regexp, function (str, ma) {
        return str.replace(ma, REPLACE_STR);
    });

    newRuntimeFileStr = `// @YENTA\n${newRuntimeFileStr}`;
    fs.writeFileSync(
        filePath
        , newRuntimeFileStr
    );
    newRuntimeFileStr = null;

    const BackupFilePath = path.resolve(
        process.cwd()
        , "node_modules"
        , ...(target.replace(/(index|esm)/i, "$1.bak").split("/"))
    );

    fs.writeFileSync(
        BackupFilePath
        , runtimeFileStr
    );

    console.log(
        chalk.blue(MOD_NAME)
        , "替换成功，备份文件位于同目录下"
    );
}

if (MARK_REGEXP.test(runtimeFileStr)) {
    console.log(
        chalk.blue(MOD_NAME)
        , `目标文件[${TARGET_FILE}]已被处理过，不再尝试替换\n`
    );
} else {
    processor(TARGET_FILE, FilePath, TARGET_REGEXP, runtimeFileStr);
}

if (MARK_REGEXP.test(esmRuntimeFileStr)) {
    console.log(
        chalk.blue(MOD_NAME)
        , `目标文件[${TARGET_ESM_FILE}]已被处理过，不再尝试替换\n`
    );
} else {
    processor(TARGET_ESM_FILE, EsmFilePath, ESM_TARGET_REGEXP, esmRuntimeFileStr);
}


runtimeFileStr = null;
