class Destination {
  final String id;
  final String name;
  final String district;
  final String region;
  final String category;
  final String description;
  final String shortDescription;
  final String imageUrl;
  final List<String> images;
  final double rating;
  final int reviewsCount;
  final int estimatedBudget;
  final int altitude;
  final String bestTimeToVisit;
  final List<String> highlights;
  final List<String> experiences;
  final double? latitude;
  final double? longitude;

  Destination({
    required this.id,
    required this.name,
    required this.district,
    required this.region,
    required this.category,
    required this.description,
    required this.shortDescription,
    required this.imageUrl,
    this.images = const [],
    required this.rating,
    required this.reviewsCount,
    required this.estimatedBudget,
    required this.altitude,
    required this.bestTimeToVisit,
    required this.highlights,
    required this.experiences,
    this.latitude,
    this.longitude,
  });

  factory Destination.fromJson(Map<String, dynamic> json) {
    final List<String> allImages = [];
    if (json['images'] is List) {
      for (final it in (json['images'] as List)) {
        if (it is Map && it['url'] != null) {
          final u = it['url'].toString().trim();
          if (u.isNotEmpty) allImages.add(u);
        } else if (it is String && it.trim().isNotEmpty) {
          allImages.add(it.trim());
        }
      }
    }

    String img = '';
    if (json['coverImage'] != null) {
      if (json['coverImage'] is Map && json['coverImage']['url'] != null) {
        img = json['coverImage']['url'].toString().trim();
      } else if (json['coverImage'] is String && json['coverImage'].isNotEmpty) {
        img = json['coverImage'].toString().trim();
      }
    }
    
    if (img.isEmpty && allImages.isNotEmpty) {
      img = allImages.first;
    } else if (img.isEmpty && json['imageUrl'] != null && json['imageUrl'].toString().isNotEmpty) {
      img = json['imageUrl'].toString().trim();
    } else if (img.isEmpty && json['image'] != null && json['image'].toString().isNotEmpty) {
      img = json['image'].toString().trim();
    }

    // Absolute Rule: NO cross-destination or random photo substitution in mobile client.
    // If backend image is missing, leave empty so UI shows entity-specific placeholder.
    if (img.startsWith('/')) {
      img = 'https://uttarakhand-hackathon-project.onrender.com$img';
    }

    double? lat;
    double? lng;
    if (json['location'] != null && json['location'] is Map) {
      final loc = json['location'];
      if (loc['coordinates'] != null && loc['coordinates'] is List && (loc['coordinates'] as List).length >= 2) {
        lng = ((loc['coordinates'] as List)[0] as num).toDouble();
        lat = ((loc['coordinates'] as List)[1] as num).toDouble();
      } else if (loc['lat'] != null && loc['lng'] != null) {
        lat = (loc['lat'] as num).toDouble();
        lng = (loc['lng'] as num).toDouble();
      }
    }

    int alt = 2000;
    if (json['altitude'] is num) {
      alt = (json['altitude'] as num).toInt();
    } else if (json['altitude'] != null) {
      alt = int.tryParse(json['altitude'].toString().replaceAll(RegExp(r'[^0-9]'), '')) ?? 2000;
    }

    int budget = 3500;
    if (json['estimatedBudget'] is num) {
      budget = (json['estimatedBudget'] as num).toInt();
    } else if (json['budget'] is num) {
      budget = (json['budget'] as num).toInt();
    }

    return Destination(
      id: json['id'] ?? json['_id'] ?? json['slug'] ?? '',
      name: json['name'] ?? '',
      district: json['district'] ?? 'Uttarakhand',
      region: json['region'] ?? 'Kumaon',
      category: json['category'] ?? 'Nature',
      description: json['description'] ?? '',
      shortDescription: json['shortDescription'] ?? json['description'] ?? '',
      imageUrl: img,
      images: allImages.isNotEmpty ? allImages : [img],
      rating: json['rating'] is num ? (json['rating'] as num).toDouble() : 4.8,
      reviewsCount: json['totalReviews'] ?? json['reviewsCount'] ?? json['reviewCount'] ?? 142,
      estimatedBudget: budget,
      altitude: alt,
      bestTimeToVisit: json['bestTimeToVisit']?.toString() ?? 'March - June, Sept - Nov',
      highlights: (json['highlights'] as List?)?.map((e) => e.toString()).toList() ?? ['Mountain Panoramas', 'Peaceful Valleys', 'Pine Trails'],
      experiences: (json['experiences'] as List?)?.map((e) => e.toString()).toList() ?? ['Trekking', 'Photography', 'Local Cuisine'],
      latitude: lat,
      longitude: lng,
    );
  }
}

class SpiritualPlace {
  final String id;
  final String name;
  final String slug;
  final String district;
  final String region;
  final String description;
  final String shortDescription;
  final String imageUrl;
  final List<String> highlights;
  final List<String> experiences;
  final double? latitude;
  final double? longitude;

  SpiritualPlace({
    required this.id,
    required this.name,
    required this.slug,
    required this.district,
    required this.region,
    required this.description,
    required this.shortDescription,
    required this.imageUrl,
    required this.highlights,
    required this.experiences,
    this.latitude,
    this.longitude,
  });

  factory SpiritualPlace.fromJson(Map<String, dynamic> json) {
    String img = '';
    if (json['image'] != null && json['image'] is Map && json['image']['url'] != null) {
      img = json['image']['url'].toString();
    } else if (json['coverImage'] != null) {
      if (json['coverImage'] is Map && json['coverImage']['url'] != null) {
        img = json['coverImage']['url'].toString();
      } else if (json['coverImage'] is String && json['coverImage'].isNotEmpty) {
        img = json['coverImage'].toString();
      }
    } else if (json['imageUrl'] != null) {
      img = json['imageUrl'].toString();
    }

    if (img.startsWith('/')) {
      img = 'https://uttarakhand-hackathon-project.onrender.com$img';
    } else if (img.isEmpty) {
      img = 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800&auto=format&fit=crop';
    }

    double? lat;
    double? lng;
    if (json['location'] != null && json['location'] is Map) {
      final loc = json['location'];
      if (loc['coordinates'] != null && loc['coordinates'] is List && (loc['coordinates'] as List).length >= 2) {
        lng = ((loc['coordinates'] as List)[0] as num).toDouble();
        lat = ((loc['coordinates'] as List)[1] as num).toDouble();
      }
    }

    return SpiritualPlace(
      id: json['_id'] ?? json['id'] ?? json['slug'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      district: json['district'] ?? 'Uttarakhand',
      region: json['region'] ?? 'Garhwal',
      description: json['description'] ?? '',
      shortDescription: json['shortDescription'] ?? json['description'] ?? '',
      imageUrl: img,
      highlights: (json['highlights'] as List?)?.map((e) => e.toString()).toList() ?? ['Ancient Shrine', 'Sacred Rituals'],
      experiences: (json['experiences'] as List?)?.map((e) => e.toString()).toList() ?? ['Aarti', 'Meditation'],
      latitude: lat,
      longitude: lng,
    );
  }
}

class CulturePlace {
  final String id;
  final String name;
  final String slug;
  final String district;
  final String region;
  final String description;
  final String shortDescription;
  final String imageUrl;
  final List<String> highlights;
  final List<String> experiences;
  final double? latitude;
  final double? longitude;

  CulturePlace({
    required this.id,
    required this.name,
    required this.slug,
    required this.district,
    required this.region,
    required this.description,
    required this.shortDescription,
    required this.imageUrl,
    required this.highlights,
    required this.experiences,
    this.latitude,
    this.longitude,
  });

  factory CulturePlace.fromJson(Map<String, dynamic> json) {
    String img = '';
    if (json['image'] != null && json['image'] is Map && json['image']['url'] != null) {
      img = json['image']['url'].toString();
    } else if (json['coverImage'] != null) {
      if (json['coverImage'] is Map && json['coverImage']['url'] != null) {
        img = json['coverImage']['url'].toString();
      } else if (json['coverImage'] is String && json['coverImage'].isNotEmpty) {
        img = json['coverImage'].toString();
      }
    } else if (json['imageUrl'] != null) {
      img = json['imageUrl'].toString();
    }

    if (img.startsWith('/')) {
      img = 'https://uttarakhand-hackathon-project.onrender.com$img';
    } else if (img.isEmpty) {
      img = 'https://images.unsplash.com/photo-1596404987012-4217117df854?q=80&w=800&auto=format&fit=crop';
    }

    double? lat;
    double? lng;
    if (json['location'] != null && json['location'] is Map) {
      final loc = json['location'];
      if (loc['coordinates'] != null && loc['coordinates'] is List && (loc['coordinates'] as List).length >= 2) {
        lng = ((loc['coordinates'] as List)[0] as num).toDouble();
        lat = ((loc['coordinates'] as List)[1] as num).toDouble();
      }
    }

    return CulturePlace(
      id: json['_id'] ?? json['id'] ?? json['slug'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      district: json['district'] ?? 'Uttarakhand',
      region: json['region'] ?? 'Kumaon',
      description: json['description'] ?? '',
      shortDescription: json['shortDescription'] ?? json['description'] ?? '',
      imageUrl: img,
      highlights: (json['highlights'] as List?)?.map((e) => e.toString()).toList() ?? ['Heritage Site', 'Folk Art'],
      experiences: (json['experiences'] as List?)?.map((e) => e.toString()).toList() ?? ['Cultural Heritage', 'Crafts'],
      latitude: lat,
      longitude: lng,
    );
  }
}

class ActivityItem {
  final String id;
  final String name;
  final String slug;
  final String district;
  final String region;
  final String description;
  final String shortDescription;
  final String imageUrl;
  final List<String> highlights;
  final List<String> experiences;
  final int? altitude;
  final int price;

  ActivityItem({
    required this.id,
    required this.name,
    required this.slug,
    required this.district,
    required this.region,
    required this.description,
    required this.shortDescription,
    required this.imageUrl,
    required this.highlights,
    required this.experiences,
    this.altitude,
    this.price = 1500,
  });

  factory ActivityItem.fromJson(Map<String, dynamic> json) {
    String img = '';
    if (json['image'] != null && json['image'] is Map && json['image']['url'] != null) {
      img = json['image']['url'].toString();
    } else if (json['coverImage'] != null) {
      if (json['coverImage'] is Map && json['coverImage']['url'] != null) {
        img = json['coverImage']['url'].toString();
      } else if (json['coverImage'] is String && json['coverImage'].isNotEmpty) {
        img = json['coverImage'].toString();
      }
    } else if (json['imageUrl'] != null) {
      img = json['imageUrl'].toString();
    }

    if (img.startsWith('/')) {
      img = 'https://uttarakhand-hackathon-project.onrender.com$img';
    } else if (img.isEmpty) {
      img = 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?q=80&w=800&auto=format&fit=crop';
    }

    return ActivityItem(
      id: json['_id'] ?? json['id'] ?? json['slug'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      district: json['district'] ?? 'Uttarakhand',
      region: json['region'] ?? 'Garhwal',
      description: json['description'] ?? '',
      shortDescription: json['shortDescription'] ?? json['description'] ?? '',
      imageUrl: img,
      highlights: (json['highlights'] as List?)?.map((e) => e.toString()).toList() ?? ['Mountain Adventure'],
      experiences: (json['experiences'] as List?)?.map((e) => e.toString()).toList() ?? ['Trekking', 'Outdoor'],
      altitude: json['altitude'],
      price: json['price'] ?? 1500,
    );
  }
}
