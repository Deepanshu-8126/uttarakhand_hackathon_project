/**
 * Verified Uttarakhand Himalayan Alpine Treks & Foot Trails
 * Contains base camps, summit elevations, trail waypoints (Lat,Lng), distances, and difficulty ratings.
 */

export const HIMALAYAN_TREKS = {
  kedarnath: {
    id: 'kedarnath',
    name: 'Kedarnath Dham Sacred Trek',
    destinationId: 'kedarnath',
    matchKeywords: ['kedarnath', 'gaurikund', 'rambara', 'lincholi'],
    baseCamp: {
      name: 'Gaurikund Roadhead Base',
      coords: [30.6510, 79.1040],
      altitudeM: 1982,
      altitude: '1,982m',
      desc: 'Vehicle terminus. Motor vehicles cannot proceed beyond Gaurikund.'
    },
    summit: {
      name: 'Kedarnath Dham Sanctuary',
      coords: [30.7352, 79.0669],
      altitudeM: 3584,
      altitude: '3,584m',
      desc: 'Sacred Jyotirlinga Shrine at 11,755 ft amidst Mandakini river basin.'
    },
    distanceKm: 16,
    estimatedTime: '6 - 8 hrs',
    difficulty: 'Demanding (High Altitude Ascend)',
    elevationGainM: 1602,
    trailType: 'Paved Mountain Foot / Pony Trail',
    advisory: 'Biometric Char Dham registration required. Strict morning departure cutoff at Gaurikund (1:30 PM).',
    // Realistic path waypoints from Gaurikund -> Jungle Chatti -> Bheembali -> Lincholi -> Base Camp -> Temple
    geometry: [
      [30.6510, 79.1040],
      [30.6590, 79.0990],
      [30.6720, 79.0880], // Jungle Chatti (4 km)
      [30.6840, 79.0810],
      [30.6950, 79.0750], // Bheembali (7 km)
      [30.7060, 79.0710],
      [30.7180, 79.0680], // Lincholi (11 km)
      [30.7260, 79.0670],
      [30.7310, 79.0665], // Kedarnath Base Camp (15 km)
      [30.7352, 79.0669]  // Kedarnath Temple (16 km)
    ],
    waypoints: [
      { name: 'Gaurikund Roadhead', coords: [30.6510, 79.1040], altitude: '1,982m', distance: '0 km', role: 'Roadhead & Biometric Gate' },
      { name: 'Jungle Chatti', coords: [30.6720, 79.0880], altitude: '2,438m', distance: '4 km', role: 'Rest & Refreshment Post' },
      { name: 'Bheembali Midway Post', coords: [30.6950, 79.0750], altitude: '2,740m', distance: '7 km', role: 'GMVN Rest Hut & Medical Aid' },
      { name: 'Lincholi Ridge', coords: [30.7180, 79.0680], altitude: '3,150m', distance: '11 km', role: 'High Camp & Acclimatization' },
      { name: 'Kedarnath Base Camp', coords: [30.7310, 79.0665], altitude: '3,450m', distance: '15 km', role: 'Helipad & GMVN Tent Colony' },
      { name: 'Kedarnath Temple', coords: [30.7352, 79.0669], altitude: '3,584m', distance: '16 km', role: 'Holy Dham Summit' }
    ]
  },

  tungnath: {
    id: 'tungnath',
    name: 'Chopta to Tungnath & Chandrashila Ridge',
    destinationId: 'tungnath',
    matchKeywords: ['tungnath', 'chopta', 'chandrashila'],
    baseCamp: {
      name: 'Chopta Meadow Base',
      coords: [30.4854, 79.1764],
      altitudeM: 2680,
      altitude: '2,680m',
      desc: 'Scenic alpine meadow known as Mini Switzerland. Road motorable from Ukhimath/Gopeshwar.'
    },
    summit: {
      name: 'Tungnath & Chandrashila Peak',
      coords: [30.4886, 79.2158],
      altitudeM: 3680,
      altitude: '3,680m',
      desc: 'Highest Shiva temple in the world (12,073 ft).'
    },
    distanceKm: 4.5,
    estimatedTime: '3 - 4 hrs',
    difficulty: 'Moderate Steep (High Altitude)',
    elevationGainM: 1000,
    trailType: 'Stone Paved Pilgrim Path',
    advisory: 'Carry windproof layer & water. Weather shifts quickly on the Chandrashila summit ridge.',
    geometry: [
      [30.4854, 79.1764], // Chopta
      [30.4870, 79.1850],
      [30.4890, 79.1950], // Meadow Treeline
      [30.4880, 79.2050],
      [30.4886, 79.2158], // Tungnath Temple
      [30.4862, 79.2230]  // Chandrashila Summit (4000m)
    ],
    waypoints: [
      { name: 'Chopta Base Meadow', coords: [30.4854, 79.1764], altitude: '2,680m', distance: '0 km', role: 'Trek Starting Point' },
      { name: 'Deodar Treeline Post', coords: [30.4890, 79.1950], altitude: '3,100m', distance: '2 km', role: 'Meadow Viewpoint' },
      { name: 'Tungnath Mandir', coords: [30.4886, 79.2158], altitude: '3,680m', distance: '3.5 km', role: 'World Highest Shiva Shrine' },
      { name: 'Chandrashila Summit', coords: [30.4862, 79.2230], altitude: '4,000m', distance: '4.5 km', role: '360° Himalayan Panorama Peak' }
    ]
  },

  valleyofflowers: {
    id: 'valleyofflowers',
    name: 'Valley of Flowers & Ghangaria Trail',
    destinationId: 'valleyofflowers',
    matchKeywords: ['valley of flowers', 'valleyofflowers', 'ghangaria', 'hemkund', 'govindghat', 'pulna'],
    baseCamp: {
      name: 'Govindghat / Pulna Base',
      coords: [30.6247, 79.5630],
      altitudeM: 1828,
      altitude: '1,828m',
      desc: 'Alaknanda confluence. Taxis operate up to Pulna (4 km).'
    },
    summit: {
      name: 'Valley of Flowers UNESCO Park',
      coords: [30.7280, 79.6053],
      altitudeM: 3658,
      altitude: '3,658m',
      desc: 'UNESCO World Heritage botanical sanctuary.'
    },
    distanceKm: 14,
    estimatedTime: '5 - 6 hrs',
    difficulty: 'Moderate Scenic River Trail',
    elevationGainM: 1830,
    trailType: 'Stone Paved Mountain Valley Trail',
    advisory: 'National Park permit required at entry gate. No overnight stay permitted inside the core valley.',
    geometry: [
      [30.6247, 79.5630], // Govindghat
      [30.6350, 79.5700], // Pulna
      [30.6550, 79.5780],
      [30.6700, 79.5850], // Bhyundar
      [30.6880, 79.5900],
      [30.7005, 79.5934], // Ghangaria Base
      [30.7150, 79.5990],
      [30.7280, 79.6053]  // Valley of Flowers
    ],
    waypoints: [
      { name: 'Govindghat Rail/Road Hub', coords: [30.6247, 79.5630], altitude: '1,828m', distance: '0 km', role: 'Valley Roadhead' },
      { name: 'Pulna Village Gate', coords: [30.6350, 79.5700], altitude: '1,920m', distance: '4 km', role: 'Footpath Entry Post' },
      { name: 'Bhyundar River Bridge', coords: [30.6700, 79.5850], altitude: '2,400m', distance: '8 km', role: 'Midway Tea Houses' },
      { name: 'Ghangaria Base Settlement', coords: [30.7005, 79.5934], altitude: '3,050m', distance: '11 km', role: 'Night Halt & Forest Checkpost' },
      { name: 'Valley of Flowers Core', coords: [30.7280, 79.6053], altitude: '3,658m', distance: '14 km', role: 'Alpine Floral Basin' }
    ]
  },

  yamunotri: {
    id: 'yamunotri',
    name: 'Janki Chatti to Yamunotri Dham Trail',
    destinationId: 'yamunotri',
    matchKeywords: ['yamunotri', 'janki chatti', 'jankichatti', 'kharsali'],
    baseCamp: {
      name: 'Janki Chatti Roadhead',
      coords: [30.9850, 78.4350],
      altitudeM: 2650,
      altitude: '2,650m',
      desc: 'Vehicle terminus for Yamunotri.'
    },
    summit: {
      name: 'Yamunotri Dham Temple',
      coords: [31.0142, 78.4600],
      altitudeM: 3291,
      altitude: '3,291m',
      desc: 'First of Char Dham shrines, origin of holy Yamuna river.'
    },
    distanceKm: 6,
    estimatedTime: '3 - 4 hrs',
    difficulty: 'Moderate to Steep',
    elevationGainM: 641,
    trailType: 'Paved Step Trail with Railings',
    advisory: 'Pony and dandi services available at Janki Chatti rate counter. Hot sulphur springs (Surya Kund) at summit.',
    geometry: [
      [30.9850, 78.4350], // Janki Chatti
      [30.9900, 78.4400], // Kharsali bypass
      [31.0020, 78.4500], // Bhairav Temple
      [31.0142, 78.4600]  // Yamunotri
    ],
    waypoints: [
      { name: 'Janki Chatti Base', coords: [30.9850, 78.4350], altitude: '2,650m', distance: '0 km', role: 'Roadhead & Pony Stand' },
      { name: 'Kharsali Fork', coords: [30.9900, 78.4400], altitude: '2,675m', distance: '1.5 km', role: 'Winter Seat of Yamuna' },
      { name: 'Bhairav Temple Point', coords: [31.0020, 78.4500], altitude: '2,900m', distance: '3.5 km', role: 'Rest & Water Post' },
      { name: 'Yamunotri Dham', coords: [31.0142, 78.4600], altitude: '3,291m', distance: '6 km', role: 'Holy Shrine & Surya Kund' }
    ]
  },

  auli_gorson: {
    id: 'auli_gorson',
    name: 'Auli to Gorson Bugyal High Meadow Trail',
    destinationId: 'auli',
    matchKeywords: ['auli', 'gorson', 'bugyal', 'gurson'],
    baseCamp: {
      name: 'Auli Ski Resort / Ropeway Top',
      coords: [30.5312, 79.5694],
      altitudeM: 2800,
      altitude: '2,800m',
      desc: 'Accessible via motor road from Joshimath or Asia longest cable car.'
    },
    summit: {
      name: 'Gorson Bugyal Viewpoint',
      coords: [30.5550, 79.6100],
      altitudeM: 3519,
      altitude: '3,519m',
      desc: 'Spectacular alpine meadow overlooking Nanda Devi and Trishul.'
    },
    distanceKm: 5,
    estimatedTime: '2 - 3 hrs',
    difficulty: 'Easy to Moderate Scenic Walk',
    elevationGainM: 719,
    trailType: 'Natural Meadow Footpath',
    advisory: 'In winter (Jan-Mar), snow spikes or snowshoes are recommended.',
    geometry: [
      [30.5312, 79.5694], // Auli Top
      [30.5390, 79.5850], // Padiyar Temple
      [30.5480, 79.5980], // Gorson Lower
      [30.5550, 79.6100]  // Gorson Viewpoint
    ],
    waypoints: [
      { name: 'Auli Chairlift Top', coords: [30.5312, 79.5694], altitude: '2,800m', distance: '0 km', role: 'Trailhead' },
      { name: 'Padiyar Mandir Forest', coords: [30.5390, 79.5850], altitude: '3,100m', distance: '2 km', role: 'Oak & Rhododendron Forest' },
      { name: 'Gorson Bugyal Meadow', coords: [30.5480, 79.5980], altitude: '3,350m', distance: '3.5 km', role: 'Expansive Alpine Grassland' },
      { name: 'Gorson Peak Point', coords: [30.5550, 79.6100], altitude: '3,519m', distance: '5 km', role: 'Nanda Devi Himalayan Vista' }
    ]
  },

  munsiyari_khaliya: {
    id: 'munsiyari_khaliya',
    name: 'Munsiyari to Khaliya Top Ridge',
    destinationId: 'munsiyari',
    matchKeywords: ['munsiyari', 'khaliya', 'khaliya top', 'panchachuli'],
    baseCamp: {
      name: 'Balati Bend (Munsiyari)',
      coords: [30.0750, 80.2280],
      altitudeM: 2300,
      altitude: '2,300m',
      desc: 'Trailhead 9 km before Munsiyari main town on Thal road.'
    },
    summit: {
      name: 'Khaliya Top Peak',
      coords: [30.1020, 80.1980],
      altitudeM: 3500,
      altitude: '3,500m',
      desc: 'Dramatic view of Panchachuli I-V peaks.'
    },
    distanceKm: 6,
    estimatedTime: '3 - 4 hrs',
    difficulty: 'Moderate Alpine Ascent',
    elevationGainM: 1200,
    trailType: 'Forested Ridge to Alpine Bugyal',
    advisory: 'Forest entry fee applies. KMVN Rest House available at 2,850m.',
    geometry: [
      [30.0750, 80.2280],
      [30.0880, 80.2150],
      [30.0950, 80.2050],
      [30.1020, 80.1980]
    ],
    waypoints: [
      { name: 'Balati Bend Trailhead', coords: [30.0750, 80.2280], altitude: '2,300m', distance: '0 km', role: 'Roadhead Entry' },
      { name: 'Khaliya KMVN Shelter', coords: [30.0880, 80.2150], altitude: '2,850m', distance: '3 km', role: 'Midway Shelter & Tea' },
      { name: 'Khaliya Bugyal Meadow', coords: [30.0950, 80.2050], altitude: '3,200m', distance: '4.5 km', role: 'Panchachuli Vista' },
      { name: 'Khaliya Summit Point', coords: [30.1020, 80.1980], altitude: '3,500m', distance: '6 km', role: '3,500m Panoramic Ridge' }
    ]
  }
};

/**
 * Find matching trek for any destination name or canonical hub
 */
export function findMatchingTrek(destinationHub) {
  if (!destinationHub) return null;
  const name = (destinationHub.name || destinationHub.id || '').toLowerCase().trim();
  const full = (destinationHub.fullName || '').toLowerCase().trim();

  for (const trek of Object.values(HIMALAYAN_TREKS)) {
    if (trek.destinationId === destinationHub.id) return trek;
    for (const kw of trek.matchKeywords) {
      if (name.includes(kw) || full.includes(kw)) {
        return trek;
      }
    }
  }
  return null;
}
