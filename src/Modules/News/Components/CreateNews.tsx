import { useNavigate } from 'react-router-dom';
import NewsForm from './NewsForm';
import { useAddNews, type CreateNewsInput } from '../Services/NewsServices';

export default function CreateNews() {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useAddNews();

  const handleSubmit = (payload: CreateNewsInput) =>
    mutate(payload, { onSuccess: () => navigate('/admin/news') });

  return (
    <div className="news-page">
      <h1>Crear noticia</h1>
      {error && <div className="error">Error al crear la noticia</div>}
      <NewsForm onSubmit={handleSubmit} submitting={isPending} />
    </div>
  );
}
