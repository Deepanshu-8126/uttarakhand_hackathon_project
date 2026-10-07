import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  fetchItems, 
  createItem, 
  updateItem, 
  deleteItem, 
  uploadAdminImage,
  updateBookingStatus,
  updateReviewStatusAdmin,
  deleteReviewAdmin,
  updateUserRoleAdmin
} from '../api/adminApi';
import ImageUploader from '../components/ImageUploader';
import { 
  X, 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  Edit3, 
  Trash2, 
  Eye, 
  ExternalLink, 
  Star, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  DollarSign, 
  Layers,
  ArrowLeft,
  Filter,
  Check
} from 'lucide-react';
import { resolveEntityImage, getImageUrl, formatLocation } from '../utils/imageUtils';

const COMMON_AMENITIES = [
  'Free WiFi',
  'Mountain View',
  'River View',
  'Home Cooked Meals',
  'Hot Water / Geyser',
  'Free Parking',
  'Bonfire & BBQ',
  'Trek Guide Available',
  'Kitchen Access',
  'Room Heater',
  'Power Backup',
  'Pet Friendly'
];

const AdminManagement = () => {
  const { type } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const [coverImages, setCoverImages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    loadItems();
    setSearchQuery('');
    setSelectedDistrict('all');
  }, [type]);

  const showToast = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await fetchItems(type);
      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error(`Error loading ${type}:`, err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const itemName = items.find(i => i._id === id)?.name || items.find(i => i._id === id)?.title || type;
    if (!window.confirm(`Are you sure you want to permanently delete "${itemName}"?`)) return;
    
    try {
      if (type === 'reviews') {
        await deleteReviewAdmin(id);
      } else {
        await deleteItem(type, id);
      }
      setItems(items.filter((item) => item._id !== id));
      showToast(`Successfully deleted ${itemName}`);
    } catch (err) {
      console.error(err);
      alert('Failed to delete item: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleBookingStatusChange = async (id, status, paymentStatus) => {
    try {
      await updateBookingStatus(id, { status, paymentStatus });
      setItems(items.map(item => item._id === id ? { ...item, status, ...(paymentStatus ? { paymentStatus } : {}) } : item));
      showToast(`Updated booking status to ${status}`);
    } catch (err) {
      alert('Failed to update booking status');
    }
  };

  const handleReviewStatusChange = async (id, status) => {
    try {
      await updateReviewStatusAdmin(id, status);
      setItems(items.map(item => item._id === id ? { ...item, status } : item));
      showToast(`Review marked as ${status}`);
    } catch (err) {
      alert('Failed to update review status');
    }
  };

  const handleUserRoleChange = async (id, role) => {
    try {
      await updateUserRoleAdmin(id, role);
      setItems(items.map(item => item._id === id ? { ...item, role } : item));
      showToast(`User role updated to ${role}`);
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    
    if (item) {
      setFormData({
        ...item,
        highlightsText: Array.isArray(item.highlights) ? item.highlights.join(', ') : (item.highlights || ''),
        amenitiesList: Array.isArray(item.amenities) ? item.amenities : [],
        languagesText: Array.isArray(item.languages) ? item.languages.join(', ') : (item.languages || ''),
        lat: item.location?.coordinates ? item.location.coordinates[1] : (item.latitude || ''),
        lng: item.location?.coordinates ? item.location.coordinates[0] : (item.longitude || '')
      });
      
      // Extract images
      if (['destinations', 'spiritual', 'culture', 'activities'].includes(type)) {
        setCoverImages(item.coverImage ? [item.coverImage] : (item.images && item.images[0] ? [item.images[0]] : []));
        setGalleryImages(item.gallery || (item.images ? item.images.slice(1) : []));
      } else if (type === 'rentals' || type === 'stays') {
        setCoverImages(item.image ? [item.image] : (item.images && item.images[0] ? [item.images[0]] : []));
        setGalleryImages(item.images ? (item.image ? item.images.filter(img => img !== item.image) : item.images) : []);
      } else if (type === 'guides') {
        setCoverImages(item.profileImage ? [item.profileImage] : (item.image ? [item.image] : []));
        setGalleryImages([]);
      }
    } else {
      setFormData({
        district: 'Dehradun',
        category: type === 'rentals' ? 'Bike' : type === 'stays' ? 'Homestay' : 'Tourism',
        amenitiesList: ['Free WiFi', 'Mountain View'],
        isFeatured: false,
        isActive: true,
        rating: 4.8
      });
      setCoverImages([]);
      setGalleryImages([]);
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value
    }));
  };

  const toggleAmenity = (amenity) => {
    const current = formData.amenitiesList || [];
    if (current.includes(amenity)) {
      setFormData({ ...formData, amenitiesList: current.filter(a => a !== amenity) });
    } else {
      setFormData({ ...formData, amenitiesList: [...current, amenity] });
    }
  };

  const handleUploadImages = async (imagesArray) => {
    const uploadedResults = [];
    for (const img of imagesArray) {
      if (img instanceof File) {
        try {
          const res = await uploadAdminImage(img);
          if (res.success) uploadedResults.push(res.image);
        } catch (err) {
          console.warn('Image upload fallback, using local URL preview', err);
          uploadedResults.push({ url: URL.createObjectURL(img), alt: 'Uploaded image' });
        }
      } else if (typeof img === 'string') {
        uploadedResults.push({ url: img, alt: 'Direct image link' });
      } else if (img && typeof img === 'object') {
        uploadedResults.push(img);
      }
    }
    return uploadedResults;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const payload = { ...formData };
      
      // Process images
      const processedCover = await handleUploadImages(coverImages);
      const processedGallery = await handleUploadImages(galleryImages);

      if (['destinations', 'spiritual', 'culture', 'activities'].includes(type)) {
        payload.coverImage = processedCover[0] || null;
        payload.gallery = processedGallery;
      } else if (type === 'rentals' || type === 'stays') {
        payload.image = processedCover[0]?.url || (typeof processedCover[0] === 'string' ? processedCover[0] : null);
        payload.images = [
          ...(processedCover.map(c => typeof c === 'string' ? c : c?.url).filter(Boolean)),
          ...(processedGallery.map(g => typeof g === 'string' ? g : g?.url).filter(Boolean))
        ];
      } else if (type === 'guides') {
        payload.profileImage = processedCover[0]?.url || (typeof processedCover[0] === 'string' ? processedCover[0] : null);
        payload.image = payload.profileImage;
      }

      // Process lists / tags
      if (formData.highlightsText) {
        payload.highlights = formData.highlightsText.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (formData.languagesText) {
        payload.languages = formData.languagesText.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (formData.amenitiesList) {
        payload.amenities = formData.amenitiesList;
      }

      // GeoJSON Coordinates
      if (formData.lat && formData.lng) {
        payload.latitude = parseFloat(formData.lat);
        payload.longitude = parseFloat(formData.lng);
        payload.location = {
          type: 'Point',
          coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)]
        };
      }

      // Generate slug if missing
      if (!payload.slug && payload.name) {
        payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }

      if (editingItem) {
        await updateItem(type, editingItem._id, payload);
        showToast(`Successfully updated ${payload.name || payload.title || 'item'}`);
      } else {
        await createItem(type, payload);
        showToast(`Successfully created new ${type.slice(0, -1)}`);
      }
      
      await loadItems();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save item: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  // Filter & Search Logic
  const filteredItems = items.filter(item => {
    const title = (item.name || item.title || item.vehicleName || item.user?.name || item.user?.email || item.email || '').toLowerCase();
    const loc = formatLocation(item, '').toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase()) || loc.includes(searchQuery.toLowerCase());
    const matchesDistrict = selectedDistrict === 'all' || item.district === selectedDistrict || item.city === selectedDistrict;
    return matchesSearch && matchesDistrict;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = a.name || a.title || a.vehicleName || '';
      const nameB = b.name || b.title || b.vehicleName || '';
      return nameA.localeCompare(nameB);
    }
    if (sortBy === 'price') {
      const priceA = a.price || a.pricePerDay || a.pricePerNight || a.startingPrice || 0;
      const priceB = b.price || b.pricePerDay || b.pricePerNight || b.startingPrice || 0;
      return priceB - priceA;
    }
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  // Unique districts for filter
  const allDistricts = Array.from(new Set(items.map(i => i.district || i.city).filter(Boolean)));

  const isSpecialCategory = ['bookings', 'reviews', 'users', 'partners'].includes(type);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Navigation Breadcrumb & Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="space-y-1">
            <Link 
              to="/admin" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              <ArrowLeft size={14} /> Back to Master Admin Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold capitalize text-stone-900 dark:text-white tracking-tight">
                Manage {type}
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                {items.length} records
              </span>
            </div>
          </div>

          {!isSpecialCategory && (
            <button 
              onClick={() => openModal()} 
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-emerald-900/30 text-sm shrink-0"
            >
              <Plus size={16} /> Add New {type.slice(0, -1)}
            </button>
          )}
        </div>

        {/* Action Toast Notification */}
        {actionSuccessMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-emerald-800 dark:text-emerald-200 text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Filter and View Controls Bar */}
        <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${type} by name, city, district...`}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* District & Sorting Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {allDistricts.length > 0 && !isSpecialCategory && (
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Locations ({items.length})</option>
                {allDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}

            {!isSpecialCategory && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price (High to Low)</option>
                <option value="rating">Sort by Rating</option>
              </select>
            )}

            {/* View Mode Switcher */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-stone-400'}`}
                title="Grid / Photo Card View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-stone-400'}`}
                title="Table / List View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Display: Loading / Empty / Grid / Table */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-stone-500">Loading {type} records and high-res photography...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-stone-200 dark:border-stone-800 space-y-4">
            <Layers className="mx-auto text-stone-300 dark:text-stone-600" size={48} />
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">No {type} found</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              No records match your query "{searchQuery}". You can clear filters or add a new entry with photos.
            </p>
            {!isSpecialCategory && (
              <button
                onClick={() => openModal()}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all"
              >
                + Add First {type.slice(0, -1)}
              </button>
            )}
          </div>
        ) : isSpecialCategory ? (
          /* Special Categories View: Bookings, Reviews, Users */
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-700 font-bold text-stone-600 dark:text-stone-300">
                  {type === 'bookings' && (
                    <tr>
                      <th className="p-4">Booking ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Item / Service</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Dates</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  )}
                  {type === 'reviews' && (
                    <tr>
                      <th className="p-4">Reviewer</th>
                      <th className="p-4">Target Item</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Comment</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  )}
                  {type === 'users' && (
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Current Role</th>
                      <th className="p-4">Elevate / Change Role</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredItems.map(item => (
                    <tr key={item._id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                      {type === 'bookings' && (
                        <>
                          <td className="p-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            #{item._id?.slice(-6)}
                          </td>
                          <td className="p-4">
                            <div className="font-bold">{item.user?.name || 'Guest User'}</div>
                            <div className="text-stone-400 text-[11px]">{item.user?.email || '-'}</div>
                          </td>
                          <td className="p-4 font-semibold">{item.item?.name || item.bookingType || 'Uttarakhand Service'}</td>
                          <td className="p-4 font-bold text-stone-900 dark:text-white">₹{item.totalAmount?.toLocaleString() || '0'}</td>
                          <td className="p-4 text-stone-500">
                            {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              item.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                              item.status === 'cancelled' ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300' :
                              'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            }`}>
                              {item.status || 'pending'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => handleBookingStatusChange(item._id, 'confirmed', 'paid')}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleBookingStatusChange(item._id, 'cancelled')}
                              className="px-2.5 py-1 bg-stone-200 dark:bg-stone-700 hover:bg-red-500 hover:text-white text-stone-700 dark:text-stone-200 rounded-lg text-xs font-bold"
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      )}

                      {type === 'reviews' && (
                        <>
                          <td className="p-4 font-bold">{item.user?.name || item.userName || 'Anonymous'}</td>
                          <td className="p-4 font-semibold">{item.itemType || item.targetSlug || 'Listing'}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star size={14} className="fill-amber-400" />
                              {item.rating || 5}
                            </div>
                          </td>
                          <td className="p-4 text-stone-600 dark:text-stone-300 max-w-sm truncate">{item.comment || '-'}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              item.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                              item.status === 'flagged' ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300' :
                              'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            }`}>
                              {item.status || 'pending'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => handleReviewStatusChange(item._id, 'approved')}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="px-2.5 py-1 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-lg text-xs font-bold"
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}

                      {type === 'users' && (
                        <>
                          <td className="p-4 font-bold text-stone-900 dark:text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold">
                              {(item.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            {item.name || 'Anonymous User'}
                          </td>
                          <td className="p-4 font-mono text-stone-500">{item.email}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                              item.role === 'admin' ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300' :
                              item.role === 'officer' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' :
                              item.role === 'partner' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' :
                              'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                            }`}>
                              {item.role || 'user'}
                            </span>
                          </td>
                          <td className="p-4">
                            <select
                              value={item.role || 'user'}
                              onChange={(e) => handleUserRoleChange(item._id, e.target.value)}
                              className="px-2.5 py-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="user">User / Explorer</option>
                              <option value="partner">Partner (Vendor)</option>
                              <option value="officer">Tourism Officer</option>
                              <option value="admin">Super Admin</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-red-500 hover:text-red-700 font-bold text-xs"
                            >
                              Remove
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View: Full Photo Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => {
              const img = resolveEntityImage(item, type);
              const title = item.name || item.title || item.vehicleName || 'Uttarakhand Item';
              const loc = formatLocation(item);
              const price = item.price || item.pricePerDay || item.pricePerNight || item.startingPrice;
              const photoCount = (item.gallery?.length || item.images?.length || 0) + (img ? 1 : 0);

              return (
                <div 
                  key={item._id}
                  className="group bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
                >
                  {/* Card Image Banner */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-200 dark:bg-stone-800">
                    <img 
                      src={img} 
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                      onClick={() => setLightboxImage(img)}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

                    {/* Image count pill */}
                    <button
                      onClick={() => setLightboxImage(img)}
                      className="absolute top-3 left-3 bg-black/60 hover:bg-black/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow"
                    >
                      <Eye size={12} />
                      <span>{photoCount} {photoCount === 1 ? 'photo' : 'photos'}</span>
                    </button>

                    {/* Rating badge */}
                    {item.rating && (
                      <span className="absolute top-3 right-3 bg-black/60 text-amber-400 font-bold text-xs px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
                        <Star size={12} className="fill-amber-400" />
                        {item.rating}
                      </span>
                    )}

                    {/* Price banner */}
                    {price && (
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-emerald-700/90 text-white font-bold text-xs px-3 py-1 rounded-lg backdrop-blur-md shadow">
                          ₹{price.toLocaleString()} {item.pricePerDay ? '/ day' : item.pricePerNight ? '/ night' : 'starting'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {item.category || item.vehicleType || item.propertyType || type}
                        </span>
                        {item.district && (
                          <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium flex items-center gap-1">
                            <MapPin size={12} className="text-emerald-600" /> {item.district}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-lg text-stone-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {title}
                      </h3>

                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
                        {item.shortDescription || item.description || item.bio || 'Authentic Himalayan experience listed in Discovery Uttarakhand.'}
                      </p>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(item)}
                          className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {item.slug && (
                        <Link
                          to={type === 'destinations' ? `/destinations/${item.slug}` : `/${type}/${item.slug}`}
                          target="_blank"
                          className="text-stone-400 hover:text-emerald-600 text-xs font-semibold flex items-center gap-1"
                          title="Open live on website"
                        >
                          <span>Live Link</span>
                          <ExternalLink size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View: Compact & Fast */
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-700 font-bold text-stone-600 dark:text-stone-300">
                  <tr>
                    <th className="p-4 w-16">Photo</th>
                    <th className="p-4">Name / Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Location / District</th>
                    <th className="p-4">Price / Rate</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredItems.map(item => {
                    const img = resolveEntityImage(item, type);
                    const title = item.name || item.title || item.vehicleName || 'Item';
                    const loc = formatLocation(item, '-');
                    const price = item.price || item.pricePerDay || item.pricePerNight || item.startingPrice;

                    return (
                      <tr key={item._id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                        <td className="p-3">
                          <img
                            src={img}
                            alt={title}
                            className="w-12 h-12 rounded-xl object-cover cursor-pointer hover:scale-110 transition-transform shadow-sm"
                            onClick={() => setLightboxImage(img)}
                          />
                        </td>
                        <td className="p-4 font-bold text-stone-900 dark:text-white max-w-xs">
                          <div>{title}</div>
                          {item.slug && <div className="text-[10px] text-stone-400 font-mono font-normal">/{item.slug}</div>}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] font-bold">
                            {item.category || item.vehicleType || item.propertyType || type}
                          </span>
                        </td>
                        <td className="p-4 text-stone-600 dark:text-stone-300">{loc}</td>
                        <td className="p-4 font-bold text-emerald-700 dark:text-emerald-400">
                          {price ? `₹${price.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-4">
                          {item.rating ? (
                            <span className="flex items-center gap-1 font-bold text-amber-500">
                              <Star size={12} className="fill-amber-400" /> {item.rating}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => openModal(item)}
                            className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="px-3 py-1.5 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Comprehensive Add / Edit Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto pt-20 pb-12">
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-4xl border border-stone-200 dark:border-stone-800 overflow-hidden my-auto animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-white capitalize">
                  {editingItem ? `Edit ${type.slice(0, -1)}: ${formData.name || formData.title || ''}` : `Add New ${type.slice(0, -1)} to Portal`}
                </h2>
                <p className="text-xs text-stone-500">
                  Complete metadata, geo-coordinates, and high-resolution photography.
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Core Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    {type === 'rentals' ? 'Vehicle Name & Model' : 'Name / Title'} *
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name || formData.title || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        name: val,
                        title: val,
                        ...(!editingItem ? { slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') } : {})
                      }));
                    }}
                    placeholder="e.g. Royal Enfield Himalayan 450 or Kedarkantha Sanctuary"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    URL Slug (Unique identifier) *
                  </label>
                  <input
                    required
                    type="text"
                    name="slug"
                    value={formData.slug || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. himalayan-450-dehradun"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Geographic & Classification */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    District / Region
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Uttarkashi, Nainital, Chamoli"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    City / Local Hub
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city || formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value, location: e.target.value })}
                    placeholder="e.g. Rishikesh, Joshimath, Dehradun"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    Category / Type
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category || formData.vehicleType || formData.propertyType || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, vehicleType: e.target.value, propertyType: e.target.value })}
                    placeholder="e.g. Bike, Homestay, Trek, Temple"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Pricing & Ratings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    {type === 'rentals' ? 'Price Per Day (₹)' : type === 'stays' ? 'Price Per Night (₹)' : 'Starting Price (₹)'}
                  </label>
                  <input
                    type="number"
                    name="pricePerDay"
                    value={formData.pricePerDay || formData.pricePerNight || formData.startingPrice || formData.price || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormData({ 
                        ...formData, 
                        pricePerDay: val, 
                        pricePerNight: val, 
                        startingPrice: val, 
                        price: val 
                      });
                    }}
                    placeholder="e.g. 1500"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    Star Rating (0 to 5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    name="rating"
                    value={formData.rating || 4.8}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    Best Season / Ideal Duration
                  </label>
                  <input
                    type="text"
                    name="bestTimeToVisit"
                    value={formData.bestTimeToVisit || formData.idealDuration || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. May to Oct, 3-4 Days"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Geo Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    Latitude (e.g. 30.3165)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="lat"
                    value={formData.lat || ''}
                    onChange={handleInputChange}
                    placeholder="30.3165"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    Longitude (e.g. 78.0322)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="lng"
                    value={formData.lng || ''}
                    onChange={handleInputChange}
                    placeholder="78.0322"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Stays / Homestay Specifics: Amenities Chips */}
              {type === 'stays' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                    Amenities & Facilities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_AMENITIES.map((amenity) => {
                      const selected = (formData.amenitiesList || []).includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            selected 
                              ? 'bg-emerald-700 text-white shadow-sm' 
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                          }`}
                        >
                          {selected && <Check size={12} />}
                          {amenity}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Highlights & Tags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                  Highlights & Key Points (Comma separated)
                </label>
                <input
                  type="text"
                  name="highlightsText"
                  value={formData.highlightsText || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. Panoramic Himalayan views, Ancient cedar forest, Sunrise viewpoint"
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                  Detailed Description & Authentic Story
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description || formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value, bio: e.target.value })}
                  placeholder="Describe the atmosphere, cultural history, accessibility, and local experiences..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Image & Photo Management */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                <ImageUploader
                  label="Primary Cover Photo (Main Card Banner)"
                  images={coverImages}
                  onChange={setCoverImages}
                  multiple={false}
                />

                {type !== 'guides' && (
                  <ImageUploader
                    label="Gallery Photos & Scenic Views (Add multiple photos or image links)"
                    images={galleryImages}
                    onChange={setGalleryImages}
                    multiple={true}
                    maxFiles={8}
                  />
                )}
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-emerald-900/30 disabled:opacity-50"
                >
                  {isSaving ? 'Saving to Database...' : (editingItem ? 'Save Changes' : `Create ${type.slice(0, -1)}`)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Fullscreen Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="relative max-w-5xl max-h-[90vh] bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors z-20 shadow-lg"
            >
              <X size={20} />
            </button>
            <img 
              src={lightboxImage} 
              alt="High Resolution Uttarakhand Photography" 
              className="max-h-[85vh] w-auto max-w-full object-contain mx-auto"
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminManagement;

