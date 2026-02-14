import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div style={{ padding: 24 }}>
      <h1>404</h1>
      <p>{t('notFound.title')}</p>
      <Link to="/">{t('notFound.toHome')}</Link>
    </div>
  );
}