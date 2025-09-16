/**
 * @typedef {Object} SpriteDefinition
 * @property {string} src
 * @property {{ x: number, y: number }} [anchor]
 * @property {{ x: number, y: number }} [offset]
 * @property {number} [scale]
 */

/**
 * @typedef {Object} LoadedSprite
 * @property {string} id
 * @property {HTMLImageElement} image
 * @property {SpriteDefinition} definition
 */

export class SpriteManager {
  /**
   * @param {Record<string, SpriteDefinition>} definitions
   */
  constructor(definitions) {
    this.definitions = definitions;
    /** @type {Map<string, LoadedSprite>} */
    this.cache = new Map();
  }

  /**
   * @param {string} id
   * @returns {Promise<LoadedSprite>}
   */
  async load(id) {
    const cached = this.cache.get(id);
    if (cached) {
      return cached;
    }
    const definition = this.definitions[id];
    if (!definition) {
      throw new Error(`Sprite definition not found: ${id}`);
    }
    const image = await this.loadImage(definition.src);
    const record = { id, image, definition };
    this.cache.set(id, record);
    return record;
  }

  /**
   * @param {string} id
   * @returns {LoadedSprite | null}
   */
  get(id) {
    return this.cache.get(id) ?? null;
  }

  /**
   * @param {(progress: { loaded: number; total: number }) => void} [onProgress]
   */
  async loadAll(onProgress) {
    const entries = Object.keys(this.definitions);
    let loaded = 0;
    await Promise.all(
      entries.map((id) =>
        this.load(id).then((sprite) => {
          loaded += 1;
          onProgress?.({ loaded, total: entries.length, sprite });
          return sprite;
        }),
      ),
    );
  }

  /**
   * @param {string} src
   * @returns {Promise<HTMLImageElement>}
   */
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const ImageCtor = globalThis.Image;
      if (!ImageCtor) {
        reject(new Error('Image constructor is not available in this environment'));
        return;
      }
      const img = new ImageCtor();
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = src;
    });
  }
}
