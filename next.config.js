const fs = require("fs");
const path = require("path");

const withLess = require("@zeit/next-less");
const lessToJS = require("less-vars-to-js");
const withPlugins = require("next-compose-plugins");

const nextConfig = {
    env: {
        AIRTABLE_DISPOSITIF_VF_API_KEY: process.env.AIRTABLE_DISPOSITIF_VF_API_KEY,
        AIRTABLE_DISPOSITIF_VF_BASE: process.env.AIRTABLE_DISPOSITIF_VF_BASE
    }
};

const themeVariables = lessToJS(
    fs.readFileSync(path.resolve(__dirname, "./src/assets/antd-custom.less"), "utf8")
);

const lessWithAntdConfig = {
    lessLoaderOptions: {
        javascriptEnabled: true,
        modifyVars: themeVariables // make your antd custom effective
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            const antStyles = /antd\/.*?\/style.*?/;
            const origExternals = [...config.externals];
            config.externals = [
                (context, request, callback) => {
                    if (request.match(antStyles)) return callback();
                    if (typeof origExternals[0] === "function") {
                        origExternals[0](context, request, callback);
                    } else {
                        callback();
                    }
                },
                ...(typeof origExternals[0] === "function" ? [] : origExternals)
            ];

            config.module.rules.unshift({
                test: antStyles,
                use: "null-loader"
            });
        }
        return config;
    }
};

module.exports = withPlugins([[withLess, lessWithAntdConfig]], nextConfig);
