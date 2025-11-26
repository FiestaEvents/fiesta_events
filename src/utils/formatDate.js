
const formatDate = (d) => {
  if (!d) return '___________';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};
export default formatDate;