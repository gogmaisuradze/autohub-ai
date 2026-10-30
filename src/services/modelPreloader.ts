import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

let cachedGltf: any = null;
let preloadPromise: Promise<any> | null = null;
let dracoLoaderInstance: DRACOLoader | null = null;

const getDracoLoader = (cleanBase: string): DRACOLoader => {
  if (!dracoLoaderInstance) {
    dracoLoaderInstance = new DRACOLoader();
    dracoLoaderInstance.setDecoderPath(`${cleanBase}draco/`);
    dracoLoaderInstance.setWorkerLimit(2);
    dracoLoaderInstance.preload();
  }
  return dracoLoaderInstance;
};

/**
 * Preload the 3D car model asset and Draco decoder in the background
 * as soon as the site initializes on the first page.
 */
export const preloadCarModel = (): Promise<any> => {
  if (cachedGltf) {
    return Promise.resolve(cachedGltf);
  }
  if (preloadPromise) {
    return preloadPromise;
  }

  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const modelUrl = `${cleanBase}models/bmw-diagnostic.glb?v=12`;

  const dracoLoader = getDracoLoader(cleanBase);
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  preloadPromise = new Promise((resolve, reject) => {
    gltfLoader.load(
      modelUrl,
      (gltf) => {
        cachedGltf = gltf;
        resolve(gltf);
      },
      undefined,
      (error) => {
        console.warn('AutoHub 3D preloader: fallback to in-scene loading', error);
        preloadPromise = null;
        reject(error);
      }
    );
  });

  return preloadPromise;
};

export const getPreloadedCarModel = () => cachedGltf;
export const getPreloadPromise = () => preloadPromise;
