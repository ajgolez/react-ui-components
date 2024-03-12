import { RegionParams, Region } from 'wavesurfer.js/dist/plugins/regions.esm.js';

declare module 'wavesurfer.js' {
    interface WaveSurfer {
        addRegion(options: RegionParams): Region;
        clearRegions(): void;
        // Add other methods from the RegionsPlugin as needed
        params: {
            splitChannels: boolean;
            // Add other parameters as needed
        };
    }
}
