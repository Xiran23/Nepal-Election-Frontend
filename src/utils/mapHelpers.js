// Calculate centroid of SVG path for dot placement
export const calculatePathCentroid = (pathString) => {
  try {
    // Extract all coordinates from path
    const coordinates = [];
    const matches = pathString.match(/[ML][\d.]+,[\d.]+/g) || [];

    matches.forEach(match => {
      const [x, y] = match.substring(1).split(',').map(Number);
      if (!isNaN(x) && !isNaN(y)) {
        coordinates.push({ x, y });
      }
    });

    if (coordinates.length === 0) return { x: 0, y: 0 };

    // Calculate centroid
    let sumX = 0, sumY = 0;
    coordinates.forEach(coord => {
      sumX += coord.x;
      sumY += coord.y;
    });

    return {
      x: sumX / coordinates.length,
      y: sumY / coordinates.length
    };
  } catch (error) {
    console.error('Error calculating centroid:', error);
    return { x: 0, y: 0 };
  }
};

// Get party color based on party name
export const getPartyColor = (partyName, opacity = 1) => {
  const partyColors = {
    'Nepali Congress': '#32CD32',
    'NC': '#32CD32',
    'CPN-UML': '#DC143C',
    'UML': '#DC143C',
    'CPN-Maoist': '#8B0000',
    'Maoist': '#8B0000',
    'RSP': '#FF8C00',
    'PSP-N': '#4169E1',
    'Janata Samajwadi': '#FFD700',
    'Loktantrik Samajwadi': '#800080',
    'RPP': '#00008B',
    'Rastriya Prajatantra Party': '#00008B',
    'Hamro Nepali Party': '#FF69B4',
    'Bibeksheel Sajha': '#20B2AA',
    'Others': '#94A3B8'
  };

  const color = partyColors[partyName] || partyColors[partyName?.split(' ')[0]] || '#94A3B8';

  if (opacity < 1) {
    // Convert hex to rgba
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return color;
};

// Get province color
export const getProvinceColor = (province) => {
  const provinceColors = {
    'Province 1': '#FF6B6B',
    'Koshi': '#FF6B6B',
    'Madhesh': '#4ECDC4',
    'Bagmati': '#45B7D1',
    'Gandaki': '#96CEB4',
    'Lumbini': '#FFE194',
    'Karnali': '#E8C7A8',
    'Sudurpashchim': '#D4A5A5'
  };
  return provinceColors[province] || '#94A3B8';
};

// Generate random offset for constituency dots
export const generateDotPositions = (count, centroid) => {
  const positions = [];
  const radius = 20;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI;
    positions.push({
      x: centroid.x + radius * Math.cos(angle),
      y: centroid.y + radius * Math.sin(angle)
    });
  }

  return positions;
};

// Parse SVG path to get bounding box - supports MultiPolygon
export const getPathBoundingBox = (coordinates, geometryType) => {
  try {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    const processCoord = (coord) => {
      if (Array.isArray(coord) && coord.length >= 2 && typeof coord[0] === 'number') {
        const [x, y] = coord;
        if (!isNaN(x) && !isNaN(y)) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    };

    const processRing = (ring) => {
      if (Array.isArray(ring)) {
        ring.forEach(processCoord);
      }
    };

    // Handle MultiPolygon vs Polygon
    const polygons = geometryType === 'MultiPolygon' ? coordinates : [coordinates];
    polygons.forEach(polygon => {
      if (Array.isArray(polygon)) {
        polygon.forEach(ring => {
          if (Array.isArray(ring)) {
            // Check if this is a ring of coordinates or another level of nesting
            if (Array.isArray(ring[0]) && typeof ring[0][0] === 'number') {
              processRing(ring);
            } else if (typeof ring[0] === 'number') {
              processCoord(ring);
            }
          }
        });
      }
    });

    if (minX === Infinity) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };

    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  } catch (error) {
    console.error('Error calculating bounding box:', error);
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }
};

// Check if point is inside polygon (ray casting algorithm)
export const isPointInPolygon = (point, polygon) => {
  const { x, y } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
};

// Convert GeoJSON to SVG path - supports both Polygon and MultiPolygon
export const geoJsonToSvgPath = (coordinates, projectionFn, geometryType) => {
  if (!coordinates || !coordinates.length) return '';

  try {
    let path = '';

    const processRing = (ring) => {
      if (!ring || !ring.length) return;
      const projected = ring
        .map(coord => {
          if (Array.isArray(coord) && coord.length >= 2) {
            return projectionFn ? projectionFn(coord[0], coord[1]) : { x: coord[0], y: coord[1] };
          }
          return null;
        })
        .filter(p => p !== null && !isNaN(p.x) && !isNaN(p.y));

      if (projected.length > 0) {
        path += `M${projected[0].x},${projected[0].y}`;
        for (let i = 1; i < projected.length; i++) {
          path += ` L${projected[i].x},${projected[i].y}`;
        }
        path += ' Z ';
      }
    };

    if (geometryType === 'MultiPolygon') {
      // MultiPolygon: coordinates = [[[ring1], [ring2]], [[ring3]]]
      coordinates.forEach(polygon => {
        if (Array.isArray(polygon)) {
          polygon.forEach(ring => processRing(ring));
        }
      });
    } else {
      // Polygon: coordinates = [[ring1], [ring2]]
      coordinates.forEach(ring => processRing(ring));
    }

    return path.trim();
  } catch (error) {
    console.error('Error converting GeoJSON to SVG path:', error);
    return '';
  }
};

// Calculate centroid from GeoJSON coordinates - supports MultiPolygon
export const calculateGeoJsonCentroid = (coordinates, projectionFn, geometryType) => {
  try {
    let sumX = 0, sumY = 0, count = 0;

    const processCoord = (coord) => {
      if (Array.isArray(coord) && coord.length >= 2 && typeof coord[0] === 'number') {
        const projected = projectionFn ? projectionFn(coord[0], coord[1]) : { x: coord[0], y: coord[1] };
        if (!isNaN(projected.x) && !isNaN(projected.y)) {
          sumX += projected.x;
          sumY += projected.y;
          count++;
        }
      }
    };

    const processRing = (ring) => {
      if (Array.isArray(ring)) {
        ring.forEach(processCoord);
      }
    };

    if (geometryType === 'MultiPolygon') {
      coordinates.forEach(polygon => {
        if (Array.isArray(polygon)) {
          polygon.forEach(ring => processRing(ring));
        }
      });
    } else {
      coordinates.forEach(ring => processRing(ring));
    }

    if (count === 0) return { x: 0, y: 0 };
    return { x: sumX / count, y: sumY / count };
  } catch (error) {
    console.error('Error calculating centroid:', error);
    return { x: 0, y: 0 };
  }
};

// Scale SVG path to fit viewport
export const scalePathToViewport = (pathString, viewportWidth, viewportHeight, padding = 20) => {
  const bbox = getPathBoundingBox(pathString);
  const scaleX = (viewportWidth - padding * 2) / bbox.width;
  const scaleY = (viewportHeight - padding * 2) / bbox.height;
  const scale = Math.min(scaleX, scaleY);

  const translateX = (viewportWidth - bbox.width * scale) / 2 - bbox.minX * scale;
  const translateY = (viewportHeight - bbox.height * scale) / 2 - bbox.minY * scale;

  return {
    scale,
    translateX,
    translateY,
    transform: `translate(${translateX}, ${translateY}) scale(${scale})`
  };
};