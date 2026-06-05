import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Share2, Edit } from 'lucide-react';
import { portfolioService } from '../../api/index';
import OrbitLoader from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

const PortfolioView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await portfolioService.getById(id);
        setProject(res.project);
      } catch (error) {
        console.error("Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center"><OrbitLoader /></div>;
  if (!project) return <div className="p-10 text-center">Project not found</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      
      {/* Hero Header */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate('/portfolio')} className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors">
              <ArrowLeft size={18} /> Back to Portfolio
            </button>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" icon={Share2}>Share</Button>
              <Button variant="primary" size="sm" icon={Edit} onClick={() => navigate(`/portfolio/${id}/edit`)}>Edit</Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">
                {project.category}
              </span>
              <span className="flex items-center gap-1 text-gray-500 text-sm">
                <Calendar size={14} /> {new Date(project.date).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
            {project.description && (
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {project.items.map((item, index) => (
            <div key={index} className="break-inside-avoid rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <img 
                src={item.url} 
                alt="" 
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;