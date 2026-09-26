class Rental {
  final String id;
  final String name;
  final String type;
  final String location;
  final int pricePerDay;
  final double rating;
  final String imageUrl;
  final bool helmetIncluded;
  final bool available;
  final bool isVerified;

  Rental({
    required this.id,
    required this.name,
    required this.type,
    required this.location,
    required this.pricePerDay,
    required this.rating,
    required this.imageUrl,
    required this.helmetIncluded,
    required this.available,
    required this.isVerified,
  });

  factory Rental.fromJson(Map<String, dynamic> json) {
    String img = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80';
    if (json['coverImage'] != null) {
      if (json['coverImage'] is Map && json['coverImage']['url'] != null) {
        img = json['coverImage']['url'].toString();
      } else if (json['coverImage'] is String && json['coverImage'].toString().isNotEmpty) {
        img = json['coverImage'].toString();
      }
    } else if (json['images'] is List && (json['images'] as List).isNotEmpty) {
      final first = (json['images'] as List)[0];
      if (first is Map && first['url'] != null) {
        img = first['url'].toString();
      } else if (first is String) {
        img = first.toString();
      }
    } else if (json['imageUrl'] != null && json['imageUrl'].toString().isNotEmpty) {
      img = json['imageUrl'].toString();
    }

    if (img.startsWith('/assets/')) {
      img = 'https://uttarakhand-hackathon-project.onrender.com$img';
    }

    int price = 600;
    if (json['vehicles'] is List && (json['vehicles'] as List).isNotEmpty) {
      final prices = (json['vehicles'] as List)
          .whereType<Map>()
          .map((v) => v['pricePerDay'])
          .whereType<num>()
          .map((n) => n.toInt())
          .toList();
      if (prices.isNotEmpty) {
        price = prices.reduce((a, b) => a < b ? a : b);
      }
    } else if (json['pricePerDay'] is num) {
      price = (json['pricePerDay'] as num).toInt();
    } else if (json['price'] is num) {
      price = (json['price'] as num).toInt();
    }

    String loc = 'Rishikesh';
    if (json['city'] != null && json['district'] != null) {
      loc = '${json['city']}, ${json['district']}';
    } else if (json['location'] is String && (json['location'] as String).isNotEmpty) {
      loc = json['location'];
    } else if (json['city'] != null) {
      loc = json['city'].toString();
    }

    return Rental(
      id: json['id'] ?? json['_id'] ?? json['slug'] ?? '',
      name: json['name'] ?? 'Pahadi Ride',
      type: json['category'] ?? json['type'] ?? json['vehicleType'] ?? 'Bike & Scooter Rental',
      location: loc,
      pricePerDay: price,
      rating: json['rating'] is num ? (json['rating'] as num).toDouble() : 4.8,
      imageUrl: img,
      helmetIncluded: json['helmetIncluded'] ?? true,
      available: json['available'] ?? json['isAvailable'] ?? true,
      isVerified: json['lastVerified'] != null || json['isVerified'] == true,
    );
  }
}

class Stay {
  final String id;
  final String name;
  final String location;
  final String stayType;
  final int pricePerNight;
  final double rating;
  final String imageUrl;
  final List<String> amenities;
  final bool isVerified;
  final String description;

  Stay({
    required this.id,
    required this.name,
    required this.location,
    required this.stayType,
    required this.pricePerNight,
    required this.rating,
    required this.imageUrl,
    required this.amenities,
    required this.isVerified,
    this.description = '',
  });

  factory Stay.fromJson(Map<String, dynamic> json) {
    String img = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80';
    if (json['image'] != null) {
      if (json['image'] is Map && json['image']['url'] != null) {
        img = json['image']['url'].toString();
      } else if (json['image'] is String && json['image'].toString().isNotEmpty) {
        img = json['image'].toString();
      }
    } else if (json['coverImage'] != null) {
      if (json['coverImage'] is Map && json['coverImage']['url'] != null) {
        img = json['coverImage']['url'].toString();
      } else if (json['coverImage'] is String && json['coverImage'].toString().isNotEmpty) {
        img = json['coverImage'].toString();
      }
    } else if (json['images'] is List && (json['images'] as List).isNotEmpty) {
      final first = (json['images'] as List)[0];
      if (first is Map && first['url'] != null) {
        img = first['url'].toString();
      } else if (first is String) {
        img = first.toString();
      }
    } else if (json['imageUrl'] != null && json['imageUrl'].toString().isNotEmpty) {
      img = json['imageUrl'].toString();
    }

    if (img.startsWith('/assets/')) {
      img = 'https://uttarakhand-hackathon-project.onrender.com$img';
    }

    int price = 1800;
    if (json['price'] is Map && json['price']['amount'] is num) {
      price = (json['price']['amount'] as num).toInt();
    } else if (json['pricePerNight'] is num) {
      price = (json['pricePerNight'] as num).toInt();
    } else if (json['price'] is num) {
      price = (json['price'] as num).toInt();
    }

    String loc = 'Uttarakhand';
    if (json['city'] != null && json['district'] != null) {
      loc = '${json['city']}, ${json['district']}';
    } else if (json['location'] is String && (json['location'] as String).isNotEmpty) {
      loc = json['location'];
    } else if (json['city'] != null) {
      loc = json['city'].toString();
    } else if (json['district'] != null) {
      loc = json['district'].toString();
    }

    final rawAmenities = json['amenities'] ?? json['facilities'];
    final amenitiesList = (rawAmenities as List?)?.map((e) => e.toString()).toList() ??
        ['Mountain View', 'Clean Linen', 'Local Meals', 'Hot Water'];

    return Stay(
      id: json['id'] ?? json['_id'] ?? json['slug'] ?? '',
      name: json['name'] ?? 'Pahadi Homestay',
      location: loc,
      stayType: json['category'] ?? json['stayType'] ?? json['type'] ?? 'Homestay',
      pricePerNight: price,
      rating: json['rating'] is num ? (json['rating'] as num).toDouble() : 4.9,
      imageUrl: img,
      amenities: amenitiesList,
      isVerified: json['isAvailable'] ?? json['isVerified'] ?? true,
      description: json['description']?.toString() ?? json['shortDescription']?.toString() ?? '',
    );
  }
}

class Guide {
  final String id;
  final String name;
  final String location;
  final String experience;
  final int pricePerDay;
  final double rating;
  final String imageUrl;
  final List<String> languages;
  final List<String> specialties;

  Guide({
    required this.id,
    required this.name,
    required this.location,
    required this.experience,
    required this.pricePerDay,
    required this.rating,
    required this.imageUrl,
    required this.languages,
    required this.specialties,
  });

  factory Guide.fromJson(Map<String, dynamic> json) {
    final guideName = json['name'] ?? 'Local Mountain Guide';
    String img = 'https://ui-avatars.com/api/?name=${Uri.encodeComponent(guideName)}&background=0f3d2e&color=ffffff&size=256&bold=true';
    if (json['profileImage'] != null && json['profileImage'].toString().isNotEmpty) {
      img = json['profileImage'].toString();
    } else if (json['imageUrl'] != null && json['imageUrl'].toString().isNotEmpty) {
      img = json['imageUrl'].toString();
    }

    String loc = 'Uttarakhand';
    if (json['location'] is String && (json['location'] as String).isNotEmpty) {
      loc = json['location'];
    } else if (json['districts'] is List && (json['districts'] as List).isNotEmpty) {
      loc = (json['districts'] as List).join(', ');
    } else if (json['city'] != null) {
      loc = json['city'].toString();
    }

    final specs = (json['specialties'] ?? json['categories'] as List?)?.map((e) => e.toString()).toList() ??
        ['High Altitude Trekking', 'Cultural Heritage', 'Mountain Navigation'];

    final langs = (json['languages'] as List?)?.map((e) => e.toString()).toList() ??
        ['Hindi', 'Garhwali', 'English'];

    return Guide(
      id: json['id'] ?? json['_id'] ?? json['slug'] ?? '',
      name: guideName,
      location: loc,
      experience: json['experience']?.toString() ?? '5+ years',
      pricePerDay: json['pricePerDay'] ?? json['ratePerDay'] ?? 1500,
      rating: json['rating'] is num ? (json['rating'] as num).toDouble() : 4.9,
      imageUrl: img,
      languages: langs,
      specialties: specs,
    );
  }
}
