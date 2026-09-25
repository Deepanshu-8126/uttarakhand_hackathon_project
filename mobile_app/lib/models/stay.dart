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
    return Rental(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? 'Pahadi Ride',
      type: json['type'] ?? json['vehicleType'] ?? 'Scooty',
      location: json['location'] ?? json['city'] ?? 'Rishikesh',
      pricePerDay: json['pricePerDay'] ?? json['price'] ?? 600,
      rating: (json['rating'] ?? 4.8).toDouble(),
      imageUrl: json['imageUrl'] ?? 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
      helmetIncluded: json['helmetIncluded'] ?? true,
      available: json['available'] ?? true,
      isVerified: json['isVerified'] ?? true,
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
  });

  factory Stay.fromJson(Map<String, dynamic> json) {
    return Stay(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? 'Pineview Homestay',
      location: json['location'] ?? json['city'] ?? 'Nainital',
      stayType: json['stayType'] ?? 'Homestay',
      pricePerNight: json['pricePerNight'] ?? json['price'] ?? 1800,
      rating: (json['rating'] ?? 4.9).toDouble(),
      imageUrl: json['imageUrl'] ?? 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
      amenities: (json['amenities'] as List?)?.map((e) => e.toString()).toList() ?? ['Wifi', 'Local Meals', 'Valley View', 'Bonfire'],
      isVerified: json['isVerified'] ?? true,
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
    return Guide(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? 'Local Mountain Guide',
      location: json['location'] ?? json['city'] ?? 'Almora',
      experience: json['experience'] ?? '5+ years',
      pricePerDay: json['pricePerDay'] ?? json['ratePerDay'] ?? 1200,
      rating: (json['rating'] ?? 4.9).toDouble(),
      imageUrl: json['imageUrl'] ?? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      languages: (json['languages'] as List?)?.map((e) => e.toString()).toList() ?? ['Hindi', 'English', 'Kumaoni'],
      specialties: (json['specialties'] as List?)?.map((e) => e.toString()).toList() ?? ['High Altitude Trekking', 'Cultural Stories'],
    );
  }
}
