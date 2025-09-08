import React from 'react';
import type { NewsItem } from '../../services/informativeService';

interface Props {
  data: NewsItem[];
}

const News: React.FC<Props> = ({ data }) => {
  return (
    <section className="news-section section" id="noticias">
      <h2 className="section-title">Últimas Noticias</h2>
      <div className="news-grid">
        {data.map((news, index) => (
          <div className="news-card" key={index}>
            <div className="news-card-img">📰 Imagen de Noticia</div>
            <div className="news-card-content">
              <div className="news-date">{news.date}</div>
              <h3>{news.title}</h3>
              <p>{news.content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default News;
