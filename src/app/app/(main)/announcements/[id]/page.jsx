import AnnouncementView from '@/components/AnnouncementView';

export const metadata = { title: 'E‘lon — Vocably', robots: { index: false } };

export default async function AnnouncementPage(props) {
  const params = await props.params;
  return <AnnouncementView id={params.id} />;
}
