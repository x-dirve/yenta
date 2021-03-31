const typescript = require("rollup-plugin-typescript2");
const resolve = require("rollup-plugin-node-resolve");
const cjs = require("rollup-plugin-commonjs");
const buble = require("rollup-plugin-buble");
const babel = require("rollup-plugin-babel");
const { join } = require("path");

const isProduction = process.env.NODE_ENV === "production";
const cwd = __dirname;

// 入口文件
const input = join(cwd, "src/index.ts");

const baseConfig = {
    input
    , "output": [
        {
            "file": join(cwd, "dist/index.js")
            , "format": "cjs"
            , "sourcemap": true
            , "exports": "named"
        }
    ]
    , "plugins": [
        resolve({
            "preferBuiltins": false
        })
        , cjs()
        , babel({
            "babelrc": false
            , "runtimeHelpers": true
            , "presets": [
                [
                    "@babel/preset-env", {
                        "modules": false
                    }
                ]
            ]
            , "plugins": [
            ]
        })
        , typescript({
            "tsconfigOverride": {
                "compilerOptions": {
                    "preserveConstEnums": true
                }
            }
            , "objectHashIgnoreUnknownHack": true
        })
        , buble()
    ]
}

module.exports = [baseConfig];
