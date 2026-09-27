import type { YarnCountSystem } from '../types';

/**
 * FABRICIQ PRO — CENTRALIZED YARN COUNT CONVERSION ENGINE
 * 
 * Direct formulas:
 * 1. Ne (English Cotton Count) = 840 yards per lb
 * 2. Nm (Metric Count) = meters per gram = 1.6934 * Ne
 * 3. Tex (Direct) = grams per 1,000 meters = 590.541 / Ne
 * 4. Denier (Direct) = grams per 9,000 meters = 9 * Tex = 5314.87 / Ne
 * 5. dTex (Direct) = grams per 10,000 meters = 10 * Tex = 5905.41 / Ne
 */

export class YarnCountEngine {
  /**
   * Convert any yarn count into English Cotton Count (Ne) as standard internal reference
   */
  public static toNe(value: number, fromSystem: YarnCountSystem): number {
    const val = Math.max(0.001, value);
    switch (fromSystem) {
      case 'Ne':
        return val;
      case 'Nm':
        return val / 1.6934;
      case 'Tex':
        return 590.541 / val;
      case 'Denier':
        return 5314.87 / val;
      case 'dTex':
        return 5905.41 / val;
      default:
        return val;
    }
  }

  /**
   * Convert from English Cotton Count (Ne) to any target yarn count system
   */
  public static fromNe(neValue: number, toSystem: YarnCountSystem): number {
    const ne = Math.max(0.001, neValue);
    switch (toSystem) {
      case 'Ne':
        return ne;
      case 'Nm':
        return ne * 1.6934;
      case 'Tex':
        return 590.541 / ne;
      case 'Denier':
        return 5314.87 / ne;
      case 'dTex':
        return 5905.41 / ne;
      default:
        return ne;
    }
  }

  /**
   * Direct conversion between any two yarn count systems
   */
  public static convert(value: number, from: YarnCountSystem, to: YarnCountSystem): number {
    if (from === to) return value;
    const ne = this.toNe(value, from);
    return Number(this.fromNe(ne, to).toFixed(2));
  }

  /**
   * Get direct linear density in Tex (g / 1,000 m)
   */
  public static toTex(value: number, system: YarnCountSystem): number {
    const ne = this.toNe(value, system);
    return 590.541 / ne;
  }

  /**
   * Get display symbol / suffix
   */
  public static getUnitLabel(system: YarnCountSystem): string {
    switch (system) {
      case 'Ne':
        return 's Ne';
      case 'Nm':
        return ' Nm';
      case 'Tex':
        return ' Tex';
      case 'Denier':
        return ' D';
      case 'dTex':
        return ' dTex';
    }
  }
}
