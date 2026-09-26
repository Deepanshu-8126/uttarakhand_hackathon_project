class Destination {
  final String id;
  final String name;
  final String district;
  final String region;
  final String category;
  final String description;
  final String shortDescription;
  final String imageUrl;
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
    String img = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
    if (json['coverImage'] != null) {
      if (json['coverImage'] is Map && json['coverImage']['url'] != null) {
        img = json['coverImage']['url'];
      } else if (json['coverImage'] is String && json['coverImage'].isNotEmpty) {
        img = json['coverImage'];
      }
    } else if (json['imageUrl'] != null && json['imageUrl'].toString().isNotEmpty) {
      img = json['imageUrl'].toString();
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

    return Destination(
      id: json['id'] ?? json['_id'] ?? json['slug'] ?? '',
      name: json['name'] ?? '',
      district: json['district'] ?? 'Uttarakhand',
      region: json['region'] ?? 'Kumaon',
      category: json['category'] ?? 'Nature',
      description: json['description'] ?? '',
      shortDescription: json['shortDescription'] ?? json['description'] ?? '',
      imageUrl: img,
      rating: (json['rating'] ?? 4.8).toDouble(),
      reviewsCount: json['reviewsCount'] ?? 142,
      estimatedBudget: json['estimatedBudget'] ?? json['budget'] ?? 3500,
      altitude: json['altitude'] ?? 2000,
      bestTimeToVisit: json['bestTimeToVisit'] ?? 'March - June, Sept - Nov',
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
    String img = 'https://images.unsplash.com/photo-1627882672776-8803eb6dfb92?q=80&w=800&auto=format&fit=crop';
    if (json['coverImage'] != null) {
      if (json['coverImage'] is Map && json['coverImage']['url'] != null) {
        img = json['coverImage']['url'];
      } else if (json['coverImage'] is String && json['coverImage'].isNotEmpty) {
        img = json['coverImage'];
      }
    } else if (json['imageUrl'] != null) {
      img = json['imageUrl'].toString();
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
    String img = 'https://images.unsplash.com/photo-1596404987012-4217117df854?q=80&w=800&auto=format&fit=crop';
    if (json['coverImage'] != null) {
      if (json['coverImage'] is Map && json['coverImage']['url'] != null) {
        img = json['coverImage']['url'];
      } else if (json['coverImage'] is String && json['coverImage'].isNotEmpty) {
        img = json['coverImage'];
      }
    } else if (json['imageUrl'] != null) {
      img = json['imageUrl'].toString();
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
    String img = 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?q=80&w=800&auto=format&fit=crop';
    if (json['coverImage'] != null) {
      if (json['coverImage'] is Map && json['coverImage']['url'] != null) {
        img = json['coverImage']['url'];
      } else if (json['coverImage'] is String && json['coverImage'].isNotEmpty) {
        img = json['coverImage'];
      }
    } else if (json['imageUrl'] != null) {
      img = json['imageUrl'].toString();
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
