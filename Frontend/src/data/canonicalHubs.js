/**
 * Canonical Uttarakhand Mountain Hubs, Gateways & Shrines
 */
export const CANONICAL_HUBS = [
  // Major Gateways & Railheads
  { id: 'delhi', name: 'Delhi', fullName: 'New Delhi (NCR Gateway)', category: 'Metropolitan Gateway', coords: [28.6139, 77.2090], altitudeM: 216, altitude: '216m', district: 'Delhi' },
  { id: 'haridwar', name: 'Haridwar', fullName: 'Haridwar Railhead Hub', category: 'Gateway Railhead', coords: [29.9457, 78.1642], altitudeM: 314, altitude: '314m', district: 'Haridwar' },
  { id: 'rishikesh', name: 'Rishikesh', fullName: 'Rishikesh Yog Nagari', category: 'Gateway Railhead', coords: [30.0869, 78.2676], altitudeM: 372, altitude: '372m', district: 'Dehradun' },
  { id: 'dehradun', name: 'Dehradun', fullName: 'Dehradun Capital & ISBT', category: 'Capital Gateway', coords: [30.3165, 78.0322], altitudeM: 447, altitude: '447m', district: 'Dehradun' },
  { id: 'kathgodam', name: 'Kathgodam', fullName: 'Kathgodam Railway Station', category: 'Gateway Railhead', coords: [29.2713, 79.5372], altitudeM: 554, altitude: '554m', district: 'Nainital' },
  { id: 'haldwani', name: 'Haldwani', fullName: 'Haldwani Junction & Bus Base', category: 'Gateway Transit Base', coords: [29.2183, 79.5130], altitudeM: 424, altitude: '424m', district: 'Nainital' },
  { id: 'tanakpur', name: 'Tanakpur', fullName: 'Tanakpur Eastern Railhead', category: 'Gateway Railhead', coords: [29.0700, 80.1100], altitudeM: 280, altitude: '280m', district: 'Champawat' },

  // Garhwal / Char Dham
  { id: 'badrinath', name: 'Badrinath', fullName: 'Badrinath Dham', category: 'Sacred Dham', coords: [30.7465, 79.4942], altitudeM: 3300, altitude: '3,300m', district: 'Chamoli', corridorId: 'badrinath' },
  { id: 'kedarnath', name: 'Kedarnath', fullName: 'Kedarnath Dham', category: 'Sacred Dham', coords: [30.7352, 79.0669], altitudeM: 3583, altitude: '3,583m', district: 'Rudraprayag', corridorId: 'kedarnath' },
  { id: 'auli', name: 'Auli', fullName: 'Auli Ski Resort & Meadows', category: 'Alpine Resort', coords: [30.5312, 79.5670], altitudeM: 2800, altitude: '2,800m', district: 'Chamoli', corridorId: 'badrinath' },
  { id: 'joshimath', name: 'Joshimath', fullName: 'Joshimath Gateway', category: 'Alpine Gateway', coords: [30.5564, 79.5661], altitudeM: 1890, altitude: '1,890m', district: 'Chamoli', corridorId: 'badrinath' },
  { id: 'chopta', name: 'Chopta', fullName: 'Chopta & Tungnath Base', category: 'Alpine Trek', coords: [30.4854, 79.1866], altitudeM: 2680, altitude: '2,680m', district: 'Rudraprayag', corridorId: 'kedarnath' },
  { id: 'sonprayag', name: 'Sonprayag', fullName: 'Sonprayag Shuttle Gate', category: 'Transit Post', coords: [30.6040, 79.0990], altitudeM: 1829, altitude: '1,829m', district: 'Rudraprayag', corridorId: 'kedarnath' },
  { id: 'gaurikund', name: 'Gaurikund', fullName: 'Gaurikund Trek Base', category: 'Trek Base', coords: [30.6510, 79.1040], altitudeM: 1982, altitude: '1,982m', district: 'Rudraprayag', corridorId: 'kedarnath' },
  { id: 'devprayag', name: 'Devprayag', fullName: 'Devprayag Sangam', category: 'Garhwal Valley', coords: [30.1459, 78.5990], altitudeM: 618, altitude: '618m', district: 'Tehri Garhwal', corridorId: 'badrinath' },
  { id: 'rudraprayag', name: 'Rudraprayag', fullName: 'Rudraprayag Junction', category: 'Major Fork', coords: [30.2858, 78.9811], altitudeM: 895, altitude: '895m', district: 'Rudraprayag', corridorId: 'badrinath' },
  { id: 'srinagar', name: 'Srinagar Garhwal', fullName: 'Srinagar Garhwal Regional Hub', category: 'Valley City', coords: [30.2227, 78.7844], altitudeM: 560, altitude: '560m', district: 'Pauri Garhwal', corridorId: 'badrinath' },
  { id: 'mussoorie', name: 'Mussoorie', fullName: 'Mussoorie Queen of Hills', category: 'Hill Station', coords: [30.4598, 78.0644], altitudeM: 2005, altitude: '2,005m', district: 'Dehradun', corridorId: 'glacier' },
  { id: 'valleyofflowers', name: 'Valley of Flowers', fullName: 'Valley of Flowers UNESCO Park', category: 'Alpine Valley', coords: [30.7280, 79.5960], altitudeM: 3658, altitude: '3,658m', district: 'Chamoli', corridorId: 'badrinath' },
  { id: 'gangotri', name: 'Gangotri', fullName: 'Gangotri Glacier Shrine', category: 'Sacred Dham', coords: [30.9940, 79.0706], altitudeM: 3048, altitude: '3,048m', district: 'Uttarkashi', corridorId: 'glacier' },
  { id: 'yamunotri', name: 'Yamunotri', fullName: 'Yamunotri Dham Source', category: 'Sacred Dham', coords: [31.0140, 78.4600], altitudeM: 3293, altitude: '3,293m', district: 'Uttarkashi', corridorId: 'glacier' },

  // Kumaon & Eastern Frontier
  { id: 'nainital', name: 'Nainital', fullName: 'Nainital Lake City', category: 'Lake District', coords: [29.3919, 79.4542], altitudeM: 2084, altitude: '2,084m', district: 'Nainital', corridorId: 'kumaon' },
  { id: 'almora', name: 'Almora', fullName: 'Almora Cultural Ridge', category: 'Heritage Hub', coords: [29.5971, 79.6591], altitudeM: 1638, altitude: '1,638m', district: 'Almora', corridorId: 'kumaon' },
  { id: 'binsar', name: 'Binsar', fullName: 'Binsar Wildlife Sanctuary', category: 'Sanctuary Reserve', coords: [29.7064, 79.7561], altitudeM: 2412, altitude: '2,412m', district: 'Almora', corridorId: 'kumaon' },
  { id: 'kausani', name: 'Kausani', fullName: 'Kausani Sunrise Vista', category: 'Himalayan Ridge', coords: [29.8390, 79.5970], altitudeM: 1890, altitude: '1,890m', district: 'Bageshwar', corridorId: 'kumaon' },
  { id: 'munsiyari', name: 'Munsiyari', fullName: 'Munsiyari Panchachuli Base', category: 'Alpine Frontier', coords: [30.0667, 80.2333], altitudeM: 2200, altitude: '2,200m', district: 'Pithoragarh', corridorId: 'kumaon' },
  { id: 'pithoragarh', name: 'Pithoragarh', fullName: 'Pithoragarh Saur Valley', category: 'Border District Hub', coords: [29.5820, 80.2180], altitudeM: 1636, altitude: '1,636m', district: 'Pithoragarh', corridorId: 'adikailash' },
  { id: 'dharchula', name: 'Dharchula', fullName: 'Dharchula Border Gate', category: 'Permit Checkpost', coords: [29.8570, 80.5280], altitudeM: 915, altitude: '915m', district: 'Pithoragarh', corridorId: 'adikailash' },
  { id: 'gunji', name: 'Gunji', fullName: 'Gunji High Border Post', category: 'Alpine Border', coords: [30.2700, 80.9900], altitudeM: 3050, altitude: '3,050m', district: 'Pithoragarh', corridorId: 'adikailash' },
  { id: 'adikailash', name: 'Adi Kailash', fullName: 'Adi Kailash & Om Parvat Base', category: 'High Sacred Peak', coords: [30.3167, 80.6333], altitudeM: 5945, altitude: '5,945m', district: 'Pithoragarh', corridorId: 'adikailash' },
];
