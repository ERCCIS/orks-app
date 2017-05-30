/** ****************************************************************************
 * Some location transformation logic.
 *****************************************************************************/
import { LatLonEllipsoidal as LatLon, OsGridRef } from 'geodesy';
import Log from './log';
import GridRefUtils from './gridrefutils';

const helpers = {
  gridref_accuracy: {
    tetrad: 4, // 2km
    monad: 6, // 1km
    '100m': 8, // 100m
  },

  /**
   *
   * @param {type} location
   * @returns {string}
   */
  locationToGrid(location) {
    const normalisedPrecision = GridRefUtils.GridRefParser.get_normalized_precision(location.accuracy * 2); // accuracy is radius
    const nationaGridCoords = GridRefUtils.latlng_to_grid_coords(location.latitude, location.longitude);
    if (!nationaGridCoords) {
      return null;
    }
    return nationaGridCoords.to_gridref(normalisedPrecision);
  },

  /**
   *
   * @param {object} location
   * @returns {Array} latlng pairs (SW, SE, NE, NW)
   */
  getSquareBounds(location) {
    if (location.latitude) {
      const gridRefString = helpers.locationToGrid(location);
      const parsedRef = GridRefUtils.GridRefParser.factory(gridRefString);

      if (parsedRef) {
        const nationalGridRefSW = parsedRef.osRef;
        return [
          nationalGridRefSW.to_latLng(),
          (new parsedRef.NationalRef(nationalGridRefSW.x + parsedRef.length, nationalGridRefSW.y)).to_latLng(),
          (new parsedRef.NationalRef(nationalGridRefSW.x + parsedRef.length, nationalGridRefSW.y + parsedRef.length)).to_latLng(),
          (new parsedRef.NationalRef(nationalGridRefSW.x, nationalGridRefSW.y + parsedRef.length)).to_latLng()
        ];
      } else {
        return null;
      }
    } else {
      return null;
    }
  },

  /**
   *
   * @param {string} gridrefString
   * @returns {GridRefUtils.OSRef|null} SW corner of grid square
   */
  parseGrid(gridrefString) {
    let gridRef;
    const parser = GridRefUtils.GridRefParser.factory(gridrefString);

    if (parser) {
      // center gridref
      parser.osRef.x += parser.length / 2;
      parser.osRef.y += parser.length / 2;

      gridRef = parser.osRef;
    }

    return gridRef;
  },

  /**
   *
   * @param {string} gridrefString
   * @returns {unresolved}
   */
  gridrefStringToLatLng(gridrefString) {
    try {
      const parsedRef = GridRefUtils.GridRefParser.factory(gridrefString);

      if (parsedRef) {
        return parsedRef.osRef.to_latLng();
      } else {
        return null;
      }
    } catch(e) {
      Log(e.message);
    }

    return null;
  },

  /**
   *
   * @param {type} location
   * @returns {Boolean}
   */
  isInGB(location) {
    if (location.latitude) {
      const nationaGridCoords = GridRefUtils.latlng_to_grid_coords(location.latitude, location.longitude);
      return nationaGridCoords && nationaGridCoords.country === 'GB';
    }
    return false;
  },
};

export default helpers;
