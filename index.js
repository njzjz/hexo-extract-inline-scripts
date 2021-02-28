/**
 * Extract inline scripts to separate files
 * Config:
 * - assets_prefix: the prefix of assets, e.g. https://cdn.jsdelivr.net/gh/njzjz/njzjz.github.io@gh-pages
 *                  if the value is empty, hexo.config.root will be used.
 */
const crypto = require('crypto');

hexo.extend.filter.register('after_generate', function (data) {
    const hexo = this;
    const assets_prefix = hexo.config.assets_prefix || hexo.config.root;
    const reg = /<script(.*?)>(.*?)<\/script>/gi;
    const script_hashes = [];
    return Promise.all(hexo.route.list().filter(path => path.endsWith('.html')).map(path => {
        return new Promise((resolve, reject) => {
            const html = hexo.route.get(path);
            let htmlContent = "";
            html.on('data', (chunk) => (htmlContent += chunk));
            html.on('end', () => {
                // detect inline script
                hexo.route.set(path, htmlContent.replace(reg, function (str, p1, p2) {
                    if (!p2) {
                        return str;
                    }
                    var hash = crypto.createHash('md5').update(p2).digest('hex');
                    var js_path = hexo.route.format(`js/${hash}.js`);
                    if (script_hashes.indexOf(hash) < 0) {
                        script_hashes.push(hash);
                        hexo.route.set(js_path, p2);
                    }
                    return `<script src="${assets_prefix}${js_path}"${p1}></script>`;
                }));
            });
            resolve();
        });
    }));
});

