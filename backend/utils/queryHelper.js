const escapeRegExp = (string) => {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const buildQuery = (reqQuery, isTextIndexed = false) => {
  const queryObj = {};

  if (reqQuery.district) {
    queryObj.district = { $regex: new RegExp(escapeRegExp(reqQuery.district), 'i') };
  }
  if (reqQuery.category) {
    queryObj.category = { $regex: new RegExp(escapeRegExp(reqQuery.category), 'i') };
  }
  
  if (reqQuery.q) {
    if (isTextIndexed) {
      queryObj.$text = { $search: reqQuery.q };
    } else {
      queryObj.name = { $regex: new RegExp(escapeRegExp(reqQuery.q), 'i') };
    }
  }

  if (reqQuery.near) {
    const parts = reqQuery.near.split(',').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const [lng, lat] = parts;
      queryObj.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] }
        }
      };
      if (reqQuery.maxDistance && !isNaN(Number(reqQuery.maxDistance))) {
        queryObj.location.$near.$maxDistance = Number(reqQuery.maxDistance); // in meters
      }
    }
  }

  return queryObj;
};
