class HiddenLocation {
  final String name;
  final String slug;
  final String tag;
  final String district;
  final String region;
  final double lat;
  final double lng;
  final String altitude;
  final String description;
  final String bestTime;
  final String entryFee;
  final String? homestay;
  final String nearby;
  final String imageUrl;
  final double? temperature;
  final String? weatherCondition;

  const HiddenLocation({
    required this.name,
    required this.slug,
    required this.tag,
    required this.district,
    required this.region,
    required this.lat,
    required this.lng,
    required this.altitude,
    required this.description,
    required this.bestTime,
    required this.entryFee,
    this.homestay,
    required this.nearby,
    required this.imageUrl,
    this.temperature,
    this.weatherCondition,
  });

  factory HiddenLocation.fromJson(Map<String, dynamic> json) {
    final cover = json['coverImage'];
    String img = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80';
    if (cover is Map && cover['url'] != null) {
      img = cover['url'].toString();
    } else if (json['images'] is Map && json['images']['url'] != null) {
      img = json['images']['url'].toString();
    }

    final weather = json['liveWeather'] as Map<String, dynamic>?;

    return HiddenLocation(
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      tag: json['tag'] ?? 'Hidden Gem',
      district: json['district'] ?? '',
      region: json['region'] ?? 'Uttarakhand',
      lat: (json['lat'] as num?)?.toDouble() ?? 0.0,
      lng: (json['lng'] as num?)?.toDouble() ?? 0.0,
      altitude: json['altitude'] ?? '',
      description: json['description'] ?? '',
      bestTime: json['bestTime'] ?? '',
      entryFee: json['entryFee'] ?? 'Free',
      homestay: json['homestay'],
      nearby: json['nearby'] ?? '',
      imageUrl: img,
      temperature: (weather?['temperature'] as num?)?.toDouble(),
      weatherCondition: weather?['condition']?.toString(),
    );
  }
}
