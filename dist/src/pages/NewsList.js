"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const BBC_RSS_URL = '/api/bbc-news';
const NewsList = ({ onSelect }) => {
    const [news, setNews] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        async function fetchRSS() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(BBC_RSS_URL);
                const text = await res.text();
                const parser = new window.DOMParser();
                const xml = parser.parseFromString(text, 'application/xml');
                const items = Array.from(xml.querySelectorAll('item'));
                const newsList = items.map(item => {
                    const title = item.querySelector('title')?.textContent || '';
                    const link = item.querySelector('link')?.textContent || '';
                    const description = item.querySelector('description')?.textContent || '';
                    // 画像URL取得（media:thumbnail, media:content, それ以外はデフォルト）
                    let image = '';
                    const mediaThumb = item.getElementsByTagName('media:thumbnail')[0];
                    const mediaContent = item.getElementsByTagName('media:content')[0];
                    if (mediaThumb && mediaThumb.getAttribute('url')) {
                        image = mediaThumb.getAttribute('url');
                    }
                    else if (mediaContent && mediaContent.getAttribute('url')) {
                        image = mediaContent.getAttribute('url');
                    }
                    else {
                        image = '/bbc-news-default.jpg'; // public配下にデフォルト画像を用意
                    }
                    return { title, link, description, image };
                });
                setNews(newsList);
            }
            catch (e) {
                setError('BBCニュースの取得に失敗しました');
            }
            setLoading(false);
        }
        fetchRSS();
    }, []);
    // ニュースクリック時
    const handleClick = (url) => {
        console.log('window.electronAPI:', window.electronAPI);
        console.log('shellOpenExternal:', window.electronAPI && window.electronAPI.shellOpenExternal);
        const api = window.electronAPI;
        if (api?.shellOpenExternal) {
            api.shellOpenExternal(url);
        }
        else {
            window.open(url, '_blank');
        }
        onSelect();
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-3xl mx-auto py-8", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold mb-4", children: "BBC\u30CB\u30E5\u30FC\u30B9\u4E00\u89A7" }), loading && (0, jsx_runtime_1.jsx)("div", { children: "\u8AAD\u307F\u8FBC\u307F\u4E2D..." }), error && (0, jsx_runtime_1.jsx)("div", { className: "text-red-600", children: error }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: news.map((item, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded shadow p-4 flex flex-col cursor-pointer hover:bg-blue-50", onClick: () => handleClick(item.link), children: [(0, jsx_runtime_1.jsx)("img", { src: item.image, alt: item.title, className: "w-full h-40 object-cover rounded mb-2" }), (0, jsx_runtime_1.jsx)("div", { className: "font-bold text-lg mb-1", children: item.title }), (0, jsx_runtime_1.jsx)("div", { className: "text-gray-700 text-sm line-clamp-3 mb-2", dangerouslySetInnerHTML: { __html: item.description } }), (0, jsx_runtime_1.jsx)("button", { className: "mt-auto px-3 py-1 bg-blue-600 text-white rounded self-end", children: "\u8A18\u4E8B\u3092\u8AAD\u3080" })] }, i))) })] }));
};
exports.default = NewsList;
