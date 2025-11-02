import { useNavigate } from 'react-router-dom';

// Hook for common navigation patterns
export const useNavigation = () => {
  const navigate = useNavigate();

  return {
    // Go to list view
    goToList: (module) => navigate(`/${module}`),
    
    // Go to details
    goToDetails: (module, id) => navigate(`/${module}/${id}`),
    
    // Go to edit
    goToEdit: (module, id) => navigate(`/${module}/${id}/edit`),
    
    // Go to create new
    goToCreate: (module) => navigate(`/${module}/new`),
    
    // Go back
    goBack: () => navigate(-1),
  };
};