import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Image as ImageIcon, Trash2, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { portfolioService } from '../../api/index';
import OrbitLoader from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';

const PortfolioList = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  
  const categories = ['All', 'Wedding', 'Corporate', 'Portrait', 'Lifestyle', 'Events'];

  useEffect(() => {
    fetchProjects();
  }, [activeCategory, search]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (search) params.search = search;

      const res = await portfolioService.getAll(params);
      setProjects(res.projects || []);
    } catch (error) {
      toast("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if(!window.confirm("Delete this project?")) return;
    try {
      await portfolioService.delete(id);
      toast("Project deleted", "success");
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      toast("Delete failed", "error");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your creative projects</p>
        </div>
        
        <Button 
          variant="primary" 
          icon={Plus} 
          onClick={() => navigate('/portfolio/new')}
        >
          New Project
        </Button>
      </div>

      {/* Filters */}
      <Card className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center"><OrbitLoader /></div>
      ) : (
        <div className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {projects.length > 0 ? (
              projects.map((project) => (
                <PortfolioCard 
                  key={project._id} 
                  project={project} 
                  onClick={() => navigate(`/portfolio/${project._id}`)}
                  onEdit={() => navigate(`/portfolio/${project._id}/edit`)}
                  onDelete={(e) => handleDelete(e, project._id)}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>No projects found</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

const PortfolioCard = ({ project, onClick, onEdit, onDelete }) => {
  const coverImage = project.items?.find(i => i.isCover)?.url || project.items?.[0]?.url;

  return (
    <motion.div
      layout
      onClick={onClick}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {coverImage ? (
          <img src={coverImage} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={32} /></div>
        )}
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black">
            <Edit2 size={16} />
          </button>
          <button onClick={onDelete} className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-red-500">
            <Trash2 size={16} />
          </button>
        </div>
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] uppercase font-bold rounded">
          {project.category}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white truncate">{project.title}</h3>
        <p className="text-xs text-gray-500 mt-1">{project.items?.length || 0} items</p>
      </div>
    </motion.div>
  );
};

export default PortfolioList;