import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Video, 
  Trash2, 
  Edit2, 
  Download, 
  Eye, 
  Plus, 
  AlertCircle,
  CheckCircle,
  X,
  Save,
  RotateCcw
} from 'lucide-react';
import VideoPlayer from '../common/VideoPlayer';

interface VideoFile {
  filename: string;
  path: string;
  size: number;
  lastModified: string;
}

interface VideoData {
  cpr: VideoFile[];
  heimlich: VideoFile[];
}

const VideoManagement: React.FC = () => {
  const [videos, setVideos] = useState<VideoData>({ cpr: [], heimlich: [] });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'cpr' | 'heimlich'>('cpr');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [customFilename, setCustomFilename] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<VideoFile | null>(null);
  const [editingVideo, setEditingVideo] = useState<{category: string, oldName: string, newName: string} | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/videos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVideos(data.data);
      } else {
        showMessage('error', 'Failed to load videos');
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      showMessage('error', 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        showMessage('error', 'Please select a video file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        showMessage('error', 'File size must be less than 50MB');
        return;
      }
      setUploadFile(file);
      setCustomFilename(file.name);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('video', uploadFile);
      formData.append('filename', customFilename);
      formData.append('category', selectedCategory);

      const response = await fetch(`/api/videos/upload/${selectedCategory}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        showMessage('success', 'Video uploaded successfully');
        setShowUploadModal(false);
        setUploadFile(null);
        setCustomFilename('');
        loadVideos();
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      showMessage('error', 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (category: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

    try {
      const response = await fetch(`/api/videos/${category}/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        showMessage('success', 'Video deleted successfully');
        loadVideos();
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      showMessage('error', 'Delete failed');
    }
  };

  const handleRename = async () => {
    if (!editingVideo) return;

    try {
      const response = await fetch(`/api/videos/${editingVideo.category}/${editingVideo.oldName}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newFilename: editingVideo.newName })
      });

      if (response.ok) {
        showMessage('success', 'Video renamed successfully');
        setEditingVideo(null);
        loadVideos();
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.message || 'Rename failed');
      }
    } catch (error) {
      console.error('Error renaming video:', error);
      showMessage('error', 'Rename failed');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderVideoList = (category: 'cpr' | 'heimlich') => {
    const categoryVideos = videos[category] || [];
    const categoryName = category === 'cpr' ? 'CPR Training' : 'Heimlich Maneuver';

    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Video className="h-5 w-5 mr-2" />
            {categoryName} Videos ({categoryVideos.length})
          </h3>
        </div>
        
        <div className="p-6">
          {categoryVideos.length === 0 ? (
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No videos uploaded yet</p>
              <button 
                onClick={() => { setSelectedCategory(category); setShowUploadModal(true); }}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Upload your first video
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {categoryVideos.map((video, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    {editingVideo?.category === category && editingVideo?.oldName === video.filename ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editingVideo.newName}
                          onChange={(e) => setEditingVideo({...editingVideo, newName: e.target.value})}
                          className="border rounded px-2 py-1 text-sm flex-1"
                          autoFocus
                        />
                        <button 
                          onClick={handleRename}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => setEditingVideo(null)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-medium text-gray-900">{video.filename}</h4>
                        <div className="text-sm text-gray-500 mt-1">
                          <span>{formatFileSize(video.size)}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(video.lastModified).toLocaleDateString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => { setPreviewVideo(video); setShowPreviewModal(true); }}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => setEditingVideo({category, oldName: video.filename, newName: video.filename})}
                      className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg"
                      title="Rename"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    
                    <a
                      href={video.path}
                      download
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    
                    <button
                      onClick={() => handleDelete(category, video.filename)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Management</h1>
          <p className="text-gray-600 mt-1">Manage training videos for CPR and Heimlich scenarios</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={loadVideos}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Video</span>
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center space-x-2 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Video Lists */}
      <div className="grid gap-6">
        {renderVideoList('cpr')}
        {renderVideoList('heimlich')}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Video</h3>
              <button onClick={() => setShowUploadModal(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as 'cpr' | 'heimlich')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cpr">CPR Training</option>
                  <option value="heimlich">Heimlich Maneuver</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video File
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {uploadFile && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filename
                  </label>
                  <input
                    type="text"
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter filename with extension"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!uploadFile || uploading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="h-4 w-4" />
                <span>{uploading ? 'Uploading...' : 'Upload'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Video Preview</h3>
              <button onClick={() => setShowPreviewModal(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <VideoPlayer
              src={previewVideo.path}
              title={previewVideo.filename}
              className="w-full"
            />
            
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Filename:</strong> {previewVideo.filename}</p>
              <p><strong>Size:</strong> {formatFileSize(previewVideo.size)}</p>
              <p><strong>Last Modified:</strong> {new Date(previewVideo.lastModified).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoManagement;