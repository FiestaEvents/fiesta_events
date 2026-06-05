import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Upload, X, Star, GripVertical, Save, ArrowLeft,ImageIcon  } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { portfolioService } from '../../api/index';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import OrbitLoader from '../../components/common/LoadingSpinner';

const PortfolioForm = () => {
  const { id } = useParams(); // If ID exists, we are editing
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [images, setImages] = useState([]);
  const [activeDragId, setActiveDragId] = useState(null);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    if (isEdit) {
      const fetchProject = async () => {
        try {
          const res = await portfolioService.getById(id);
          const project = res.project;
          setFormData({
            title: project.title,
            category: project.category,
            description: project.description || '',
            date: new Date(project.date).toISOString().split('T')[0]
          });
          // Map existing items to match our state structure
          setImages(project.items.map((item, index) => ({
            id: item._id || `existing-${index}`,
            url: item.url,
            isCover: item.isCover,
            isExisting: true
          })));
        } catch (error) {
          toast("Failed to load project", "error");
          navigate('/portfolio');
        }
      };
      fetchProject();
    }
  }, [id]);

  // Handle File Upload (Simulated for now, replace with actual Cloudinary upload logic)
   const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const newUploadedImages = [];

    try {
      // Upload files in parallel
      const uploadPromises = files.map(async (file) => {
        try {
          const res = await portfolioService.uploadImage(file);
          return {
            id: res.publicId || `img-${Date.now()}-${Math.random()}`,
            url: res.url, // The Cloudinary URL from backend
            isCover: false,
            isNew: true
          };
        } catch (error) {
          console.error("Upload failed for file", file.name);
          toast(`Failed to upload ${file.name}`, "error");
          return null;
        }
      });
      const results = await Promise.all(uploadPromises);
      
      // Filter out failed uploads
      const successfulUploads = results.filter(img => img !== null);
      
      setImages(prev => [...prev, ...successfulUploads]);
      
      if(successfulUploads.length > 0) {
        toast(`${successfulUploads.length} images uploaded`, "success");
      }

    } catch (error) {
      toast("Error uploading images", "error");
    } finally {
      setUploading(false);
      // Reset input value to allow selecting same files again if needed
      e.target.value = ''; 
    }
  };

  const handleDeleteImage = (id) => {
    setImages(images.filter(img => img.id !== id));
  };

  const handleSetCover = (id) => {
    setImages(images.map(img => ({ ...img, isCover: img.id === id })));
  };

  // Drag and Drop Logic
  const handleDragStart = (event) => setActiveDragId(event.active.id);
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveDragId(null);
  };

  const handleSubmit = async () => {
  if (!formData.title || !formData.category) return toast("Title and Category required", "error");
  
  setLoading(true);
  try {
    const payload = {
      ...formData,
      // Map images to the Schema expected structure
      items: images.map(img => ({
        url: img.url, 
        publicId: img.id, // Optional: save this for deletions later
        isCover: img.isCover
      }))
    };

    if (isEdit) {
      await portfolioService.update(id, payload);
      toast("Project updated", "success");
    } else {
      await portfolioService.create(payload);
      toast("Project created", "success");
    }
    navigate('/portfolio');
  } catch (error) {
    toast("Save failed", "error");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/portfolio')} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
          <h1 className="text-2xl font-bold dark:text-white">{isEdit ? 'Edit Project' : 'New Project'}</h1>
        </div>
        <Button onClick={handleSubmit} loading={loading} icon={Save}>Save Project</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-lg dark:text-white">Project Details</h3>
            <Input 
              label="Project Title" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              placeholder="e.g. Summer Wedding"
            />
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select...</option>
                <option value="Wedding">Wedding</option>
                <option value="Corporate">Corporate</option>
                <option value="Portrait">Portrait</option>
                <option value="Event">Event</option>
              </select>
            </div>

            <Input 
              type="date"
              label="Date" 
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})} 
            />

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Tell the story of this project..."
              />
            </div>
          </Card>
        </div>

        {/* Right: Media Manager */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 min-h-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg dark:text-white">
            Media Gallery ({images.length})
          </h3>
          
          <div className="flex items-center gap-3">
            {/* Show loader while uploading */}
            {uploading && <span className="text-sm text-orange-500 flex items-center gap-2"><OrbitLoader size={16} color="orange"/> Uploading...</span>}
            
            <label className={`cursor-pointer flex items-center gap-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload size={16} />
              Upload Photos
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload} 
                disabled={uploading}
              />
            </label>
          </div>
        </div>
            {images.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl h-64 flex flex-col items-center justify-center text-gray-400">
                <ImageIcon size={48} className="mb-2 opacity-50"/>
                <p>Drag and drop photos here</p>
                <p className="text-xs">or click "Upload Photos"</p>
              </div>
            ) : (
              <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <SortableContext items={images} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img) => (
                      <SortableImage 
                        key={img.id} 
                        image={img} 
                        onDelete={() => handleDeleteImage(img.id)}
                        onSetCover={() => handleSetCover(img.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeDragId ? (
                    <div className="w-full h-32 bg-gray-900/50 rounded-lg backdrop-blur-sm" />
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

// Sortable Image Component
const SortableImage = ({ image, onDelete, onSetCover }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
      <img src={image.url} alt="" className="w-full h-full object-cover" />
      
      {/* Cover Badge */}
      {image.isCover && (
        <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase shadow-sm">
          Cover
        </div>
      )}

      {/* Hover Actions */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
        <div className="flex justify-end">
          <button onMouseDown={onDelete} className="p-1.5 bg-white/20 hover:bg-red-500 text-white rounded-full transition-colors">
            <X size={14} />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <button 
            onMouseDown={onSetCover}
            className={`p-1.5 rounded-full transition-colors ${image.isCover ? 'bg-orange-500 text-white' : 'bg-white/20 text-white hover:bg-orange-500'}`}
            title="Set as Cover"
          >
            <Star size={14} fill={image.isCover ? "currentColor" : "none"} />
          </button>
          
          <div {...attributes} {...listeners} className="cursor-grab p-1.5 text-white hover:bg-white/20 rounded">
            <GripVertical size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioForm;