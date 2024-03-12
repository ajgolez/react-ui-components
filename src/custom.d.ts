declare module '*.wav' {
    const src: string;
    export default src;
}
//declare module 'wavesurfer.js/dist/plugins/regions.esm.js';
//declare module 'wavesurfer.js/dist/plugins/hover.esm.js';
//declare module 'wavesurfer.js/dist/plugin/wavesurfer.cursor.js';

declare module 'wavesurfer.js/dist/plugin/wavesurfer.cursor.js';
declare module 'wavesurfer.js/dist/plugin/wavesurfer.regions';
declare module 'wavesurfer.js/dist/plugin/wavesurfer.markers';
declare module 'react-popper';
declare module 'wavesurfer.js/types/backend';


// declare module 'wavesurfer.js' {
//     interface WaveSurferEvents {
//         'region-updated': (region: Region) => void;
//         // Add other RegionsPlugin events as needed
//     }

// }


//import { RegionParams, Region } from 'wavesurfer.js/dist/plugin/wavesurfer.regions.js';

// declare module 'wavesurfer.js/dist/plugins/regions.esm.js' {
//     interface WaveSurfer {
//         addRegion(options: RegionParams): Region;
//         clearRegions(): void;
//         // Add other methods from the RegionsPlugin as needed
//     }
// }

// declare module 'wavesurfer.js' {
//     interface WaveSurferExtended extends WaveSurfer {
//         addRegion(options: RegionParams): Region;
//         clearRegions(): void;
//         // Add other methods from the RegionsPlugin as needed
//         params: {
//             splitChannels: boolean;
//             // Add other parameters as needed
//         };
//         setHeight(height: number): void;

//     }
// }