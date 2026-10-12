import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import '@maplibre/maplibre-gl-leaflet';

/** OSM Bright vector style (OpenMapTiles schema), served free by OpenFreeMap. */
export const OSM_BRIGHT_STYLE = 'https://tiles.openfreemap.org/styles/bright';

type MaplibreLeafletLayer = L.Layer & { getMaplibreMap: () => maplibregl.Map };
type LeafletWithMaplibre = typeof L & {
    maplibreGL: (options: Record<string, unknown>) => MaplibreLeafletLayer;
};

/** Draws the OSM Bright basemap under the Leaflet overlays (routes, markers) of the surrounding map. */
export default function OsmBrightLayer() {
    const map = useMap();

    useEffect(() => {
        const layer = (L as LeafletWithMaplibre).maplibreGL({
            style: OSM_BRIGHT_STYLE,
            attribution: '&copy; <a href="https://openfreemap.org">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            // Lets the map export read the canvas back.
            canvasContextAttributes: { preserveDrawingBuffer: true },
        });
        layer.addTo(map);
        return () => {
            layer.remove();
        };
    }, [map]);

    return null;
}
