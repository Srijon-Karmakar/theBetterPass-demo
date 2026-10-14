import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import '@maplibre/maplibre-gl-leaflet';
import { useTheme } from '../../hooks/useTheme';

/** Positron light and dark vector styles (OpenMapTiles schema), served free by OpenFreeMap. */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';
export const MAP_STYLE_URL_DARK = 'https://tiles.openfreemap.org/styles/dark';

type MaplibreLeafletLayer = L.Layer & { getMaplibreMap: () => maplibregl.Map };
type LeafletWithMaplibre = typeof L & {
    maplibreGL: (options: Record<string, unknown>) => MaplibreLeafletLayer;
};

/** Draws the Positron basemap (the dark style in dark mode) under the Leaflet overlays (routes, markers) of the surrounding map. */
export default function BasemapLayer() {
    const map = useMap();
    const { theme } = useTheme();

    useEffect(() => {
        const layer = (L as LeafletWithMaplibre).maplibreGL({
            style: theme === 'dark' ? MAP_STYLE_URL_DARK : MAP_STYLE_URL,
            attribution: '&copy; <a href="https://openfreemap.org">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            // Lets the map export read the canvas back.
            canvasContextAttributes: { preserveDrawingBuffer: true },
        });
        layer.addTo(map);
        return () => {
            layer.remove();
        };
    }, [map, theme]);

    return null;
}
