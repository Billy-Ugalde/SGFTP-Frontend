import { useNavigate, useParams } from 'react-router-dom';
import { useNewsById, useUpdateNews, type CreateNewsInput } from '../Services/NewsServices';
import NewsForm from './NewsForm';

export default function EditNews() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useNewsById(id!);
  const update = useUpdateNews(Number(id));

  if (isLoading) return <div className="ghost">Cargando…</div>;
  if (error || !data) return <div className="error">No se pudo cargar la noticia</div>;

  const defaults: Partial<CreateNewsInput> = {
    title: data.title,
    author: data.author,
    content: data.content,
    status: data.status,
    image_url: data.image_url || undefined,
  };

  const onSubmit = (payload: CreateNewsInput) =>
    update.mutate(payload, { onSuccess: () => navigate('/admin/news') });

  return (
    <div className="news-page">
      <h1>Editar noticia</h1>
      <NewsForm defaultValues={defaults} onSubmit={onSubmit} submitting={update.isPending} />
    </div>
  );
}
