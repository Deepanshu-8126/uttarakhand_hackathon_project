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
  });

  factory Destination.fromJson(Map<String, dynamic> json) {
    return Destination(
      id: json['id'] ?? json['_id'] ?? json['slug'] ?? '',
      name: json['name'] ?? '',
      district: json['district'] ?? 'Uttarakhand',
      region: json['region'] ?? 'Kumaon',
      category: json['category'] ?? 'Nature',
      description: json['description'] ?? '',
      shortDescription: json['shortDescription'] ?? json['description'] ?? '',
      imageUrl: json['imageUrl'] ?? json['coverImage'] ?? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      rating: (json['rating'] ?? 4.8).toDouble(),
      reviewsCount: json['reviewsCount'] ?? 142,
      estimatedBudget: json['estimatedBudget'] ?? json['budget'] ?? 3500,
      altitude: json['altitude'] ?? 2000,
      bestTimeToVisit: json['bestTimeToVisit'] ?? 'March - June, Sept - Nov',
      highlights: (json['highlights'] as List?)?.map((e) => e.toString()).toList() ?? ['Mountain Panoramas', 'Peaceful Valleys', 'Pine Trails'],
      experiences: (json['experiences'] as List?)?.map((e) => e.toString()).toList() ?? ['Trekking', 'Photography', 'Local Cuisine'],
    );
  }
}
