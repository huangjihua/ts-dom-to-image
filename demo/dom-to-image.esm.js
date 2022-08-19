var FILE_ENUM_TYPE;
(function (FILE_ENUM_TYPE) {
    FILE_ENUM_TYPE["WOFF"] = "application/font-woff";
    FILE_ENUM_TYPE["TTF"] = "application/font-truetype";
    FILE_ENUM_TYPE["EOT"] = "image/eotapplication/vnd.ms-fontobject";
    FILE_ENUM_TYPE["GIF"] = "image/gif";
    FILE_ENUM_TYPE["TIFF"] = "image/tiff";
    FILE_ENUM_TYPE["SVG"] = "image/svg+xml";
    FILE_ENUM_TYPE["JPEG"] = "image/jpeg";
    FILE_ENUM_TYPE["JPG"] = "image/jpeg";
    FILE_ENUM_TYPE["PNG"] = "image/png";
})(FILE_ENUM_TYPE || (FILE_ENUM_TYPE = {}));

const URL_REGEX = /url\(['"]?([^'"]+?)['"]?\)/g;
/**
 * 转义字符串(针对特定符号)
 * @param props  string
 * @returns string
 */
const escape = (props) => props.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
/**
 * 延迟
 * @param delayTime 延迟时间（毫秒）
 */
const delay = (delayTime) => {
    return (args) => new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(args);
        }, delayTime);
    });
};
const uid = () => {
    let index = 0;
    /* see http://stackoverflow.com/a/6248722/2519373 */
    const fourNumberRandom = `0000${(Math.random() * Math.pow(36, 4) << 0).toString(36)}`.slice(-4);
    return `u0000${fourNumberRandom}${index++}`;
};
/**
 * 数组化
 * @param arrayLike
 * @returns array
 */
const asArray = (arrayLike) => {
    const array = [];
    for (const item of arrayLike) {
        array.push(item);
    }
    return array;
};
/**
 *  转义 Xhtml
 * @param props String
 * @returns
 */
const escapeXhtml = (props) => props.replace(/#/g, '%23').replace(/\n/g, '%0A');
/**
 *  处理stylePropertyValue带px
 * @param node HTMLElement
 * @param styleProperty  string
 * @return number
 */
const px = (node, styleProperty) => {
    const val = window.getComputedStyle(node).getPropertyValue(styleProperty);
    return parseFloat(val.replace('px', ''));
};
const width = (node) => {
    const leftBorder = px(node, 'border-left-width');
    const rightBorder = px(node, 'border-right-width');
    return node.scrollWidth + leftBorder + rightBorder;
};
const height = (node) => {
    const topBorder = px(node, 'border-top-width');
    const bottomBorder = px(node, 'border-bottom-width');
    return node.scrollHeight + topBorder + bottomBorder;
};
const dataAsBase64Url = (content, type) => `data:${type};base64,${content}`;
/**
 * 解析URL扩展
 * @param url string
 */
const parseExtension = (url) => {
    const match = /\.([^\.\/]*?)$/g.exec(url);
    return match ? match[1] : '';
};
/**
 * 判断字符串是否已 data:开头
 * @param url
 * @returns {boolean}
 */
const isDataUrl = (url) => {
    return url.search(/^(data:)/) !== -1;
};
/**
 * URL正则
 * @param url
 * @returns {RegExpConstructor}
 */
const urlAsRegex = (url) => {
    return new RegExp('(url\\([\'"]?)(' + escape(url) + ')([\'"]?\\))', 'g');
};
/**
 * 检查字符串内是否存在 URL 文件资源
 * @param str
 * @returns
 */
const checkStrUrl = (str) => str.search(URL_REGEX) !== -1;
/**
 * 读取字符并解析出其中 URL
 * @param string
 * @returns {Array}
 */
const readUrls = (string) => {
    const result = [];
    let match;
    while ((match = URL_REGEX.exec(string)) !== null) {
        result.push(match[1]);
    }
    return result.filter(function (url) {
        return !isDataUrl(url);
    });
};
/**
 * 返回文件的类型
 * @param url string  文件 URL
 * @returns  string
 */
const ParsefileType = (url) => {
    const extension = parseExtension(url).toLocaleUpperCase();
    return FILE_ENUM_TYPE[extension] || '';
};
/**
 * canvas转Blob
 * @param canvas
 * @returns
 */
const toBlob = (canvas) => {
    return new Promise(resolve => {
        const binaryString = window.atob(canvas === null || canvas === void 0 ? void 0 : canvas.toDataURL().split(',')[1]);
        const length = binaryString.length;
        const binaryArray = new Uint8Array(length);
        for (let i = 0; i < length; i++)
            binaryArray[i] = binaryString.charCodeAt(i);
        resolve(new Blob([binaryArray], {
            type: 'image/png'
        }));
    });
};

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

/**
 *  XMLHttpRequest
 * @param props
 * @returns
 */
const xhr = (props) => {
    let { url } = props;
    const { httpTimeout = 30000, cacheBust = false, useCredentials = false, successHandle = () => { }, failHandle = () => { }, } = props;
    if (cacheBust) {
        // Cache bypass so we dont have CORS issues with cached images 
        // Source: https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
        url += (/\?/.test(url) ? '&' : '?') + new Date().getTime();
    }
    return new Promise(function (resolve) {
        const request = new XMLHttpRequest();
        request.onreadystatechange = handle;
        request.ontimeout = () => fail(`timeout of ${httpTimeout}ms occured while fetching resource: ${url}`);
        request.responseType = 'blob';
        request.timeout = httpTimeout;
        if (useCredentials) {
            request.withCredentials = true;
        }
        request.open('GET', url, true);
        request.send();
        function handle() {
            if (request.readyState !== 4)
                return;
            if (request.status === 200) {
                successHandle(request, resolve);
            }
            else {
                failHandle();
                fail('cannot fetch resource: ' + url + ', status: ' + request.status);
                return;
            }
        }
        function fail(message) {
            console.error(message);
            resolve('');
        }
    });
};

/**
 * 检测字符内所有的url File,并转成内联的 base64地址
 * @param {string} str
 * @param {string} baseUrl
 * @returns {Promise<string>}
 */
const checkStrUrlFile = (str, baseUrl) => {
    if (!checkStrUrl(str))
        return Promise.resolve(str);
    console.log(str, baseUrl);
    const urls = readUrls(str);
    let done = Promise.resolve(str);
    urls.forEach((url) => {
        done = done.then((str) => __awaiter(void 0, void 0, void 0, function* () {
            url = baseUrl ? createLinkUrl(url, baseUrl) : url;
            const imgData = yield readUrlFileToEncode({ url: url });
            const base64 = dataAsBase64Url(imgData, ParsefileType(url));
            return str.replace(urlAsRegex(url), '$1' + base64 + '$3');
        }));
        return done;
    });
    return done;
};

/**
 * 创建image
 * @param url img url base64 or  url
 * @returns {Promise<HTMLImageElement>}
 */
const createImage = (url) => {
    if (url === 'data:,')
        return Promise.resolve(null);
    return new Promise((resolve, reject) => {
        const img = new Image();
        // 处理跨域图片，注意：IOS 不支持该属性
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            resolve(img);
        };
        img.onerror = reject;
        img.src = url;
    });
};
/**
 * 生成新的 URL
 * @param url
 * @param baseUrl
 * @returns
 */
const createLinkUrl = (url, baseUrl) => {
    const doc = document.implementation.createHTMLDocument();
    const base = doc.createElement('base');
    doc.head.appendChild(base);
    const a = doc.createElement('a');
    doc.body.appendChild(a);
    base.href = baseUrl;
    a.href = url;
    console.log(url);
    return a.href;
};
/**
 * 读取Url 文件并转成Base64字符串
 * @param {Object} props
@return {Promise}
 */
const readUrlFileToEncode = (props) => xhr(Object.assign(Object.assign({}, props), { successHandle: (request, resolve) => {
        const encoder = new FileReader();
        // 该事件在读取操作结束时（
        encoder.onloadend = function () {
            let content = encoder.result;
            if (content && typeof content === 'string')
                content = content.split(/,/)[1];
            resolve(content);
        };
        // 开始读取指定的Blob中的内容。一旦完成，result属性中将包含一个data: URL 格式的 Base64 字符串以表示所读取文件的内容。
        encoder.readAsDataURL(request.response);
    } }));
/**
 *  检测元素的样式内的背景图，并转换为内联的 Base64形式
 * @param node HTMLELment
 */
const checkElementStyleBackgroup = (node) => __awaiter(void 0, void 0, void 0, function* () {
    if (node instanceof HTMLImageElement)
        return imgSrcToInlineBase64(node);
    if (node.style) {
        const background = node.style.getPropertyValue('background');
        if (!background)
            return node;
        const value = yield checkStrUrlFile(background);
        if (value)
            node.style.setProperty('background', value, node.style.getPropertyPriority('background'));
    }
    // node.childNodes.forEach((child: any) => checkElementStyleBackgroup(child as HTMLElement))
    const result = yield Promise.all(asArray(node.childNodes).filter((child) => child.NodeName != '#text').map((child) => {
        return checkElementStyleBackgroup(child);
    }));
    console.log(result);
    return node;
});
/**
 * 图片src地址转换成Base64并重新赋值给图片
 * @param {HTMLImageElement} element
 * @returns {Promise<string>}
 */
function imgSrcToInlineBase64(element) {
    if (isDataUrl(element.src))
        return Promise.resolve();
    return Promise.resolve(element.src)
        .then((url) => readUrlFileToEncode({ url: url }))
        .then((data) => dataAsBase64Url(data, ParsefileType(element.src)))
        .then((dataUrl) => {
        return new Promise(function (resolve, reject) {
            element.onload = resolve;
            element.onerror = reject;
            element.src = dataUrl;
        });
    });
}

/**
 *  设置克隆元素样式
 * @param  {CSSStyleDeclaration} sourceNodeCssStyle
 * @param  {CSSStyleDeclaration} cloneNodeCssStyle
 */
const setCloneNodeStyleProperty = (sourceNodeCssStyle, cloneNodeCssStyle) => {
    if (sourceNodeCssStyle.cssText) {
        cloneNodeCssStyle.cssText = sourceNodeCssStyle.cssText;
    }
    else {
        for (const key of sourceNodeCssStyle) {
            if (sourceNodeCssStyle.getPropertyValue(key)) {
                cloneNodeCssStyle.setProperty(key, sourceNodeCssStyle.getPropertyValue(key), sourceNodeCssStyle.getPropertyPriority(key));
            }
        }
    }
};
/**
 * 处理元素伪类情况
 * @param {HTMLElement} original  用于获取计算样式的Element。
 * @param {HTMLElement} clone  克隆元素（目标对象）
 */
const processNodePseudoStyle = (original, clone) => {
    if (!(clone instanceof Element))
        return clone;
    const eachPseudoStyles = () => [':before', ':after'].forEach(item => nodePseudoStyle(item));
    /**
     * 处理伪类
     * @param pseudoName 指定一个要匹配的伪元素的字符串 如:before
     * @returns {void}
     */
    function nodePseudoStyle(pseudoName) {
        const style = window.getComputedStyle(original, pseudoName);
        const content = style.getPropertyValue('content');
        if (content === '' || content === 'none')
            return;
        const className = uid();
        clone.className = clone.className + ' ' + className;
        const styleElement = document.createElement('style');
        styleElement.appendChild(getFormatPseudoStyle(className, pseudoName, style));
        clone.appendChild(styleElement);
        /**
         *  获取格式化后的TextNode
         * @param {string} className 样式名
         * @param {string} pseudoName 伪类名称
         * @param {CSSStyleDeclaration} style 样式声明对象
         * @returns {TextNode}
         */
        function getFormatPseudoStyle(className, pseudoName, style) {
            const selector = `.${className}:${pseudoName}`;
            const content = style.getPropertyValue('content');
            let cssText = '';
            if (style.cssText) {
                cssText = `${style.cssText} content: ${content};`;
            }
            else {
                for (const key of style) {
                    cssText += `${key}:${style.getPropertyValue(key)}${style.getPropertyPriority(key) ? ' !important' : ''};`;
                }
            }
            return document.createTextNode(`${selector}{${cssText}}`);
        }
    }
    // 处理表单元素
    function formCloneElementValue() {
        if (original instanceof HTMLTextAreaElement)
            clone.innerHTML = original.value;
        if (original instanceof HTMLInputElement)
            clone.setAttribute("value", original.value);
    }
    // 处理SVG
    function fixSvg() {
        if (!(clone instanceof SVGElement))
            return;
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        if (!(clone instanceof SVGRectElement))
            return;
        ['width', 'height'].forEach((attribute) => {
            var value = clone.getAttribute(attribute);
            if (!value)
                return;
            clone.style.setProperty(attribute, value);
        });
    }
    return Promise.resolve()
        .then(() => setCloneNodeStyleProperty(window.getComputedStyle(original), clone.style))
        .then(eachPseudoStyles)
        .then(formCloneElementValue)
        .then(fixSvg)
        .then(() => clone);
};

/**
 * 克隆元素
 * @param {HTMLElement} node
 * @param {object} filter
 * @param {boolean} root
 * @returns
 */
const cloneNode = (node, filter, root = false) => __awaiter(void 0, void 0, void 0, function* () {
    if (!root && filter && !filter(node))
        return;
    var children = node.childNodes;
    const clone = node instanceof HTMLCanvasElement ? yield createImage(node.toDataURL()) : node.cloneNode(false);
    processNodePseudoStyle(node, clone);
    if (children.length === 0)
        return clone;
    for (const child of children) {
        cloneNode(child, filter)
            .then((childClone) => {
            if (childClone) {
                clone.appendChild(childClone);
            }
        });
    }
    return clone;
});

/**
 * 嵌入字体
 * @param node
 * @returns
 */
const embedFonts = (node) => {
    const readAllFont = (styleSheets) => {
        const cssRules = [];
        for (const sheet of styleSheets) {
            for (const cssRule of sheet.cssRules) {
                cssRules.push.bind(cssRule, sheet.cssRules);
            }
        }
        let newFonts = [];
        const newWebFont = (rule) => {
            const resolve = () => {
                const baseUrl = (rule.parentStyleSheet || {}).href;
                return newInliner().inlineAll(rule.cssText, baseUrl);
            };
            const src = () => rule.style.getPropertyValue('src');
            return { resolve, src };
        };
        try {
            for (const rule of cssRules) {
                if (rule.type === CSSRule.FONT_FACE_RULE) {
                    newFonts.push(newWebFont(rule));
                }
                else if (checkStrUrl(rule.style.getPropertyValue('src'))) {
                    newFonts.push(newWebFont(rule));
                }
            }
        }
        catch (e) {
            console.log('Error while reading CSS rules from ' + styleSheets, e);
        }
        return newFonts;
    };
    const pNewFonts = readAllFont(document.styleSheets);
    const cssText = Promise.all(pNewFonts.map((webFont) => webFont.resolve()))
        .then((cssStrings) => cssStrings.join('\n'));
    return cssText.then((cssText) => {
        const styleNode = document.createElement('style');
        node.appendChild(styleNode);
        styleNode.appendChild(document.createTextNode(cssText));
        return node;
    });
};
/**
   * 外联资源转内联
   */
function newInliner() {
    return {
        inlineAll: inlineAll,
    };
    function inline(str, url, baseUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            url = baseUrl ? createLinkUrl(url, baseUrl) : url;
            let result = '';
            const imgData = yield readUrlFileToEncode({ url: url });
            const base64 = dataAsBase64Url(imgData, ParsefileType(url));
            result = str.replace(urlAsRegex(url), '$1' + base64 + '$3');
            return result;
        });
    }
    function inlineAll(str, baseUrl) {
        if (!checkStrUrl(str))
            return Promise.resolve(str);
        console.log(str, baseUrl);
        const urls = readUrls(str);
        let done = Promise.resolve(str);
        urls.forEach((url) => {
            done = done.then((str) => {
                return inline(str, url, baseUrl);
            });
        });
        return done;
    }
}

/**
 * 生成 SVG，base64
 * @param {Object} node
 * @param {Object} width
 * @param {Object} height
 */
const createSvgEncodeUrl = (node, width, height) => {
    return Promise.resolve(node)
        .then(node => {
        node.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
        return new XMLSerializer().serializeToString(node);
    })
        .then(escapeXhtml)
        .then(xhtml => `<foreignObject x="0" y="0" width="100%" height="100%">${xhtml}</foreignObject>`)
        .then(foreignObject => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${foreignObject}</svg>`)
        .then(svg => `data:image/svg+xml;charset=utf-8,${svg}`);
};

class DomToImage {
    /**
     * constructor
     * @param props 渲染参数
     */
    constructor(options) {
        const defaultValue = { quality: 1, cacheBust: false, useCredentials: false, httpTimeout: 30000, scale: window.devicePixelRatio };
        this.options = Object.assign(Object.assign({}, defaultValue), options);
    }
    toSvg() {
        return Promise.resolve()
            .then(() => cloneNode(this.options.targetNode, this.options.filter, true))
            .then(embedFonts)
            .then(checkElementStyleBackgroup)
            .then(this.applyOptions.bind(this))
            .then(clone => {
            clone.setAttribute('style', '');
            return createSvgEncodeUrl(clone, this.options.width || width(this.options.targetNode), this.options.height || height(this.options.targetNode));
        });
    }
    toPng() {
        return this.drawCanvas()
            .then(canvas => canvas.toDataURL(FILE_ENUM_TYPE.PNG, this.options.quality));
    }
    toJpg() {
        return this.drawCanvas()
            .then(canvas => canvas.toDataURL(FILE_ENUM_TYPE.JPG, this.options.quality));
    }
    toCanvas() {
        return this.drawCanvas()
            .then(canvas => canvas);
    }
    toBlob() {
        return this.drawCanvas()
            .then((canvas) => {
            if (canvas.toBlob)
                return new Promise(function (resolve) {
                    canvas.toBlob(resolve);
                });
            return toBlob(canvas);
        });
    }
    toPixelData() {
        return this.drawCanvas()
            .then(canvas => {
            var _a;
            return (_a = canvas.getContext('2d')) === null || _a === void 0 ? void 0 : _a.getImageData(0, 0, width(this.options.targetNode), height(this.options.targetNode)).data;
        });
    }
    drawCanvas() {
        return this.toSvg()
            .then(createImage)
            .then(delay(100))
            .then((image) => {
            const canvas = this.creatCanvas();
            const context = canvas.getContext('2d');
            if (context)
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
            return canvas;
        });
    }
    applyOptions(clone) {
        if (this.options.bgColor)
            clone.style.backgroundColor = this.options.bgColor;
        if (this.options.width)
            clone.style.width = this.options.width + 'px';
        if (this.options.height)
            clone.style.height = this.options.height + 'px';
        const styles = this.options.style;
        for (const style in styles) {
            clone.style[style] = styles[style];
        }
        return clone;
    }
    creatCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = (this.options.width || width(this.options.targetNode)) * this.options.scale;
        canvas.height = (this.options.height || height(this.options.targetNode)) * this.options.scale;
        if (this.options.bgColor) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = this.options.bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
        return canvas;
    }
}

export { DomToImage as default };
