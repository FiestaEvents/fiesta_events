import React, { useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { partnerService } from "../../../api/index";
import Button from "../../../components/common/Button";
import { toast } from "react-hot-toast";

const PortfolioTab = ({ partner, onUpdate }) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic validation
    if (file.size > 5 * 1024 * 1024) return toast.error("File too large (Max 5MB)");
    
    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      // Assuming you add uploadImage to partnerService
      const res = await partnerService.uploadImage(partner._id, formData);
      onUpdate(res.data.portfolio); // Update local state
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      const res = await partnerService.deleteImage(partner._id, imageId);
      onUpdate(res.data.portfolio);
      toast.success("Image deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Upload Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-orange-500" />
          {t("partners.portfolio.title", "Portfolio Gallery")}
        </h3>
        
        <div className="relative">
           <input 
             type="file" 
             id="portfolio-upload" 
             className="hidden" 
             accept="image/*"
             onChange={handleFileUpload}
             disabled={uploading}
           />
           <label htmlFor="portfolio-upload">
             <Button 
               as="span" 
               variant="primary" 
               icon={uploading ? Loader2 : Upload}
               className={uploading ? "cursor-wait" : "cursor-pointer"}
             >
               {uploading ? "Uploading..." : t("partners.portfolio.upload", "Upload Photo")}
             </Button>
           </label>
        </div>
      </div>

      {/* Grid */}
      {partner.portfolio && partner.portfolio.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {partner.portfolio.map((img) => (
            <div key={img._id} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100">
              <img 
                src={img.url} 
                alt="Portfolio" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                  onClick={() => window.open(img.url, '_blank')}
                  className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm"
                >
                  <ImageIcon size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(img._id)}
                  className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white backdrop-blur-sm"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{t("partners.portfolio.empty", "No images uploaded yet.")}</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioTab;