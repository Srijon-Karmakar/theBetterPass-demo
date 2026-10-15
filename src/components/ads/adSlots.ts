const mapSheet = (import.meta.env.VITE_ADSENSE_SLOT_MAP_SHEET as string | undefined)?.trim();

export const AD_SLOTS = {
    mapSheet,
    // Falls back to the map-sheet unit until a dedicated puja unit is created.
    pujaPanel: (import.meta.env.VITE_ADSENSE_SLOT_PUJA_PANEL as string | undefined)?.trim() || mapSheet,
};
