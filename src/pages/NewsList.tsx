import React, { useEffect, useState } from 'react';

interface NewsItem {
  title: string;
  link: string;
  description: string;
  image: string;
}

interface Props {
  onSelect: () => void; // 記事クリック後に記事入力画面へ遷移するコールバック
}

const BBC_RSS_URL = '/api/bbc-news';

const NewsList: React.FC<Props> = ({ onSelect }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRSS() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(BBC_RSS_URL);
        const text = await res.text();
        const parser = new window.DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');
        const items = Array.from(xml.querySelectorAll('item'));
        const newsList: NewsItem[] = items.map(item => {
          const title = item.querySelector('title')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          // 画像URL取得（media:thumbnail, media:content, それ以外はデフォルト）
          let image = '';
          const mediaThumb = item.getElementsByTagName('media:thumbnail')[0];
          const mediaContent = item.getElementsByTagName('media:content')[0];
          if (mediaThumb && mediaThumb.getAttribute('url')) {
            image = mediaThumb.getAttribute('url')!;
          } else if (mediaContent && mediaContent.getAttribute('url')) {
            image = mediaContent.getAttribute('url')!;
          } else {
            image = '/bbc-news-default.jpg'; // public配下にデフォルト画像を用意
          }
          return { title, link, description, image };
        });
        setNews(newsList);
      } catch (e) {
        setError('BBCニュースの取得に失敗しました');
      }
      setLoading(false);
    }
    fetchRSS();
  }, []);

  // ニュースクリック時
  const handleClick = (url: string) => {
    console.log('window.electronAPI:', window.electronAPI);
    console.log('shellOpenExternal:', window.electronAPI && (window.electronAPI as any).shellOpenExternal);
    const api: any = window.electronAPI;
    if (api?.shellOpenExternal) {
      api.shellOpenExternal(url);
    } else {
      window.open(url, '_blank');
    }
    onSelect();
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">BBCニュース一覧</h2>
      {loading && <div>読み込み中...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {news.map((item, i) => (
          <div key={i} className="bg-white rounded shadow p-4 flex flex-col cursor-pointer hover:bg-blue-50" onClick={() => handleClick(item.link)}>
            <img src={item.image} alt={item.title} className="w-full h-40 object-cover rounded mb-2" />
            <div className="font-bold text-lg mb-1">{item.title}</div>
            <div className="text-gray-700 text-sm line-clamp-3 mb-2" dangerouslySetInnerHTML={{ __html: item.description }} />
            <button className="mt-auto px-3 py-1 bg-blue-600 text-white rounded self-end">記事を読む</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsList; 