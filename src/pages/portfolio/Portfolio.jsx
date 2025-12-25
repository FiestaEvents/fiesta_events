import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Image as ImageIcon, Trash2, Edit2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

//  API Service (Use your standard API pattern)
import { portfolioService } from '../../api/index'; 

// Common Components
import OrbitLoader from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal'; // Assuming you have a generic Modal
import Input from '../../components/common/Input'; // Assuming you have a generic Input

//  Hooks
import { useToast } from '../../context/ToastContext'; // Correct context path

const Portfolio = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', category: '' });

  // Dummy Categories (Fetch from DB later if dynamic)
  const categories = ['All', 'Wedding', 'Corporate', 'Portrait', 'Lifestyle', 'Events'];

  useEffect(() => {
    fetchProjects();
  }, [activeCategory, search]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Construct query params
      const params = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (search) params.search = search;

      const res = await portfolioService.getAll(params); // Standard service call
      setProjects(res.projects || []);
    } catch (error) {
      console.error(error);
      toast(t("portfolio.errors.fetchFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if(!newProject.title || !newProject.category) return;
    try {
      await portfolioService.create(newProject);
      toast("Project created successfully", "success");
      setIsModalOpen(false);
      setNewProject({ title: '', category: '' });
      fetchProjects();
    } catch (error) {
      toast("Failed to create project", "error");
    }
  };

  const handleDeleteProject = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await portfolioService.delete(id);
      toast("Project deleted", "success");
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      toast("Failed to delete", "error");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white rounded-lg dark:bg-gray-900 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("portfolio.title", "Portfolio")}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t("portfolio.subtitle", "Showcase your best work")}</p>
        </div>
        
        <Button 
          variant="primary" 
          icon={Plus} 
          onClick={() => setIsModalOpen(true)}
        >
          {t("portfolio.actions.new", "New Project")}
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="flex flex-col md:flex-row justify-between items-center gap-4 p-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto pb-2 md:pb-0">
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
            placeholder={t("common.search", "Search...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
          />
        </div>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <OrbitLoader />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {projects.length > 0 ? (
              projects.map((project) => (
                <PortfolioCard 
                  key={project._id} 
                  project={project} 
                  onDelete={() => handleDeleteProject(project._id)} 
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>{t("portfolio.empty", "No projects found")}</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal (Simple Implementation) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold dark:text-white">Create New Project</h3>
            <Input 
              label="Title"
              value={newProject.title}
              onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              placeholder="e.g. Summer Wedding"
            />
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label>
              <select 
                value={newProject.category}
                onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select Category</option>
                {categories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateProject}>Create</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Sub-component: Project Card
const PortfolioCard = ({ project, onDelete }) => {
  // Safe access for cover image
  const coverImage = project.items && project.items.length > 0 
    ? (project.items.find(i => i.isCover)?.url || project.items[0]?.url) 
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {/* Image Area */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={project.title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
            <ImageIcon size={32} />
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <button className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all">
            <Edit2 size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-red-500 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-wider rounded">
          {project.category}
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors truncate">
          {project.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex justify-between">
          <span>{project.items?.length || 0} items</span>
          <span>{new Date(project.date).toLocaleDateString()}</span>
        </p>
      </div>
    </motion.div>
  );
};

export default Portfolio;