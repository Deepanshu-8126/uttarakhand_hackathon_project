import User from '../models/User.js';
import Favorite from '../models/Favorite.js';
import ExploreLater from '../models/ExploreLater.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import SavedTrip from '../models/SavedTrip.js';
import Trip from '../models/Trip.js';
import Destination from '../models/Destination.js';
import Spiritual from '../models/Spiritual.js';
import Culture from '../models/Culture.js';
import Activity from '../models/Activity.js';
import Stay from '../models/Stay.js';
import Rental from '../models/Rental.js';
import Guide from '../models/Guide.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const avatarUrl = user.avatarUrl || user.profileImage?.url || null;
    res.json({ 
      success: true, 
      data: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || user.mobile || '',
        mobile: user.mobile || user.phone || '',
        role: user.role,
        profileImage: user.profileImage || null,
        avatar: avatarUrl,
        avatarUrl: avatarUrl,
        location: user.location || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('[GetUserProfile Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT/PATCH /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    // 1. Strict Identity from JWT Middleware (req.user.id) — never client body
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 2. Email Immutability Protection (Section 4)
    if (req.body.email && req.body.email.trim().toLowerCase() !== user.email.toLowerCase()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address is linked to your account credentials and cannot be changed here.' 
      });
    }

    // 3. Name Validation
    if (req.body.name !== undefined) {
      const trimmedName = String(req.body.name).trim();
      if (trimmedName.length < 2) {
        return res.status(400).json({ success: false, message: 'Full name must be at least 2 characters long.' });
      }
      user.name = trimmedName;
    }

    // 4. Server-Side Phone Validation (Section 5)
    if (req.body.phone !== undefined) {
      const rawPhone = String(req.body.phone).trim();
      if (rawPhone.length > 0) {
        const digitsOnly = rawPhone.replace(/\D/g, '');
        if (digitsOnly.length < 10 || digitsOnly.length > 15) {
          return res.status(400).json({ 
            success: false, 
            message: 'Please provide a valid mobile number (10 to 15 digits).' 
          });
        }
        user.phone = rawPhone;
      } else {
        user.phone = '';
      }
    }

    // 5. Location (Safely handle String OR Object without throwing TypeError)
    if (req.body.location !== undefined) {
      if (typeof req.body.location === 'string') {
        const trimmedLoc = req.body.location.trim();
        user.location = {
          city: trimmedLoc,
          district: user.location?.district || '',
          state: user.location?.state || 'Uttarakhand',
          country: user.location?.country || 'India',
        };
      } else if (typeof req.body.location === 'object' && req.body.location !== null) {
        user.location = {
          city: req.body.location.city || req.body.location.name || req.body.location.address || '',
          district: req.body.location.district || '',
          state: req.body.location.state || 'Uttarakhand',
          country: req.body.location.country || 'India',
          coordinates: req.body.location.coordinates || undefined
        };
      }
    }

    // 6. Profile Photo (Upload, Replace, or Explicit Removal)
    if (req.body.removeProfilePhoto === true || req.body.profileImage === null) {
      // Remove profile photo & destroy existing Cloudinary asset if publicId exists
      if (user.profileImage?.publicId && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        try {
          await cloudinary.uploader.destroy(user.profileImage.publicId);
        } catch (cErr) {
          console.warn('[Cloudinary Delete Notice]', cErr.message || cErr);
        }
      }
      user.profileImage = null;
      user.avatarUrl = null;
    } else if (req.body.profileImage) {
      let photoUrl = '';
      let photoPublicId = null;

      if (typeof req.body.profileImage === 'string') {
        const imgStr = req.body.profileImage.trim();
        if (imgStr.startsWith('data:image') && imgStr.length > 2048) {
          return res.status(400).json({ 
            success: false, 
            message: 'Direct base64 photo storage is not allowed. Please upload via Cloudinary or standard photo URL.' 
          });
        }
        photoUrl = imgStr;
        photoPublicId = req.body.publicId || req.body.profileImagePublicId || null;
      } else if (typeof req.body.profileImage === 'object' && req.body.profileImage.url) {
        photoUrl = String(req.body.profileImage.url).trim();
        photoPublicId = req.body.profileImage.publicId || null;
      }

      if (photoUrl) {
        // If replacing an existing Cloudinary asset with a different one, clean up the previous asset
        if (
          user.profileImage?.publicId &&
          photoPublicId &&
          user.profileImage.publicId !== photoPublicId &&
          process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_API_KEY &&
          process.env.CLOUDINARY_API_SECRET
        ) {
          try {
            await cloudinary.uploader.destroy(user.profileImage.publicId);
          } catch (cErr) {
            console.warn('[Cloudinary Replace Notice]', cErr.message || cErr);
          }
        }

        user.profileImage = {
          url: photoUrl,
          publicId: photoPublicId,
          source: 'User Upload',
          alt: `${user.name} Profile Photo`
        };
        user.avatarUrl = photoUrl;
      }
    }

    // 7. Password update only if explicitly provided with length >= 6
    if (req.body.password && typeof req.body.password === 'string' && req.body.password.length >= 6) {
      user.password = req.body.password;
    }

    // 8. STRICT ROLE PROTECTION (Normal user cannot elevate role or privileges)
    // user.role is intentionally NOT updated from req.body

    const updatedUser = await user.save();
    const finalAvatar = updatedUser.avatarUrl || updatedUser.profileImage?.url || null;

    // 9. Safe User DTO (Never return password or sensitive fields)
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || updatedUser.mobile || '',
        mobile: updatedUser.mobile || updatedUser.phone || '',
        role: updatedUser.role,
        profileImage: updatedUser.profileImage || null,
        avatar: finalAvatar,
        avatarUrl: finalAvatar,
        location: updatedUser.location || '',
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    console.error('[UpdateUserProfile Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update profile.' });
  }
};

// @desc    Delete/Remove User Profile Photo
// @route   DELETE /api/users/profile/photo
// @access  Private
export const deleteProfilePhoto = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Safely delete Cloudinary asset if publicId exists
    if (user.profileImage?.publicId && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        await cloudinary.uploader.destroy(user.profileImage.publicId);
      } catch (cErr) {
        console.warn('[Cloudinary Delete Notice]', cErr.message || cErr);
      }
    }

    user.profileImage = null;
    user.avatarUrl = null;
    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile photo removed successfully.',
      data: {
        _id: updatedUser._id,
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || updatedUser.mobile || '',
        mobile: updatedUser.mobile || updatedUser.phone || '',
        role: updatedUser.role,
        profileImage: null,
        avatar: null,
        avatarUrl: null,
        location: updatedUser.location || '',
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    console.error('[DeleteProfilePhoto Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to remove profile photo.' });
  }
};


// @desc    Get user bookings
// @route   GET /api/users/bookings
// @access  Private
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('stay')
      .populate('rental')
      .populate('guide');
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create booking
// @route   POST /api/users/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const { 
      type, 
      bookingType, 
      stay, 
      rental, 
      guide, 
      item, 
      vehicleName, 
      startDate, 
      endDate, 
      guests, 
      notes, 
      totalAmount 
    } = req.body;
    
    const resolvedType = type || bookingType || 'stay';
    
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start date and end date are required' });
    }

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const days = Math.max(1, Math.ceil(Math.abs(eDate - sDate) / (1000 * 60 * 60 * 24)));

    let stayId = stay;
    let rentalId = rental;
    let guideId = guide;

    if (item) {
      if (resolvedType === 'stay') stayId = item;
      if (resolvedType === 'rental') rentalId = item;
      if (resolvedType === 'guide') guideId = item;
    }

    let calculatedAmount = totalAmount || null;

    if (!calculatedAmount && stayId) {
      const stayDoc = await Stay.findById(stayId);
      if (stayDoc?.price?.amount) {
        calculatedAmount = stayDoc.price.amount * days;
      }
    }

    const booking = await Booking.create({
      user: req.user.id,
      type: resolvedType,
      stay: stayId,
      rental: rentalId,
      guide: guideId,
      startDate: sDate,
      endDate: eDate,
      guests: guests || 1,
      amount: calculatedAmount,
      notes: notes || '',
      status: 'pending'
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user reviews
// @route   GET /api/users/reviews
// @access  Private
export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user trips
// @route   GET /api/users/trips
// @access  Private
export const getUserTrips = async (req, res) => {
  try {
    const savedTrips = await SavedTrip.find({ user: req.user.id })
      .populate('destinations')
      .populate('activities')
      .populate('stays');
    const legacyTrips = await Trip.find({ user: req.user.id }).populate('destinations');
    res.json({ success: true, data: [...savedTrips, ...legacyTrips] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all user saved items (3 Sections: Explore Later, Favorites, Saved Trips)
// @route   GET /api/users/saved-items
// @access  Private
export const getSavedItems = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Explore Later Items
    const exploreLater = await ExploreLater.find({ user: userId })
      .populate('destination')
      .populate('savedGuideIds')
      .populate('savedStays')
      .sort({ updatedAt: -1 })
      .lean();

    // 2. Favorites (Categorized)
    const favoritesRaw = await Favorite.find({ user: userId })
      .populate('item')
      .sort({ updatedAt: -1 })
      .lean();

    const validFavs = favoritesRaw.filter(f => f.item != null);

    // 3. Saved Trips
    const savedTrips = await SavedTrip.find({ user: userId })
      .populate('destinations')
      .populate('activities')
      .populate('stays')
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        exploreLater,
        favorites: validFavs,
        savedTrips
      }
    });
  } catch (error) {
    console.error('[getSavedItems Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Create or update Explore Later item
// @route   POST /api/users/explore-later
// @access  Private
export const createExploreLater = async (req, res) => {
  try {
    const userId = req.user.id;
    const { destinationId, destinationName, activityType, date, notes, guideIds, placeIds } = req.body;

    if (!destinationName) {
      return res.status(400).json({ success: false, message: 'destinationName is required' });
    }

    const filter = { user: userId, destinationName, activityType: activityType || 'Trek' };
    const update = {
      $set: {
        user: userId,
        destinationId: destinationId || destinationName.toLowerCase().replace(/\s+/g, '-'),
        destinationName,
        activityType: activityType || 'Trek',
        status: 'PLANNING_LATER',
        date: date || null,
        notes: notes || `Saved for explore later`
      }
    };

    if (Array.isArray(guideIds) && guideIds.length > 0) {
      update.$addToSet = { savedGuideIds: { $each: guideIds } };
    }
    if (Array.isArray(placeIds) && placeIds.length > 0) {
      update.$addToSet = { ...(update.$addToSet || {}), savedPlaceIds: { $each: placeIds } };
    }

    const item = await ExploreLater.findOneAndUpdate(filter, update, { upsert: true, new: true });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Explore Later item
// @route   DELETE /api/users/explore-later/:id
// @access  Private
export const deleteExploreLater = async (req, res) => {
  try {
    const item = await ExploreLater.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Explore Later item not found' });
    }
    res.json({ success: true, message: 'Removed from Explore Later' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};