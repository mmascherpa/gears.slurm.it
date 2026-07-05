/**
 * Tests for vaultStorage - IndexedDB persistence with localStorage migration
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import {
  loadVaultData,
  saveVaultData,
  deleteVaultData,
  vaultDataExists
} from '@/utils/vaultStorage';

const LEGACY_KEY = 'slurm-password-vault';

function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

describe('vaultStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    global.indexedDB = new IDBFactory();
  });

  describe('save/load round-trip', () => {
    it('persists and returns the exact bytes', async () => {
      const bytes = new Uint8Array([1, 2, 3, 250, 251, 252]);

      await saveVaultData(bytes);
      const loaded = await loadVaultData();

      expect(loaded).toBeInstanceOf(Uint8Array);
      expect(Array.from(loaded)).toEqual(Array.from(bytes));
    });

    it('overwrites previous vault data', async () => {
      await saveVaultData(new Uint8Array([1, 1, 1]));
      await saveVaultData(new Uint8Array([2, 2]));

      const loaded = await loadVaultData();
      expect(Array.from(loaded)).toEqual([2, 2]);
    });

    it('returns null when nothing is stored', async () => {
      expect(await loadVaultData()).toBeNull();
    });
  });

  describe('legacy localStorage migration', () => {
    it('migrates a base64 localStorage vault into IndexedDB', async () => {
      const original = new Uint8Array([10, 20, 30, 40, 200]);
      localStorage.setItem(LEGACY_KEY, toBase64(original));

      const loaded = await loadVaultData();

      expect(Array.from(loaded)).toEqual(Array.from(original));
      // localStorage copy removed after successful migration
      expect(localStorage.getItem(LEGACY_KEY)).toBeNull();

      // Subsequent loads come from IndexedDB
      const reloaded = await loadVaultData();
      expect(Array.from(reloaded)).toEqual(Array.from(original));
    });

    it('prefers IndexedDB data over a lingering localStorage value', async () => {
      await saveVaultData(new Uint8Array([9, 9, 9]));
      localStorage.setItem(LEGACY_KEY, toBase64(new Uint8Array([1])));

      const loaded = await loadVaultData();
      expect(Array.from(loaded)).toEqual([9, 9, 9]);
    });
  });

  describe('vaultDataExists', () => {
    it('is false with no stored vault', async () => {
      expect(await vaultDataExists()).toBe(false);
    });

    it('is true with a vault in IndexedDB', async () => {
      await saveVaultData(new Uint8Array([1]));
      expect(await vaultDataExists()).toBe(true);
    });

    it('is true with a legacy vault awaiting migration', async () => {
      localStorage.setItem(LEGACY_KEY, toBase64(new Uint8Array([1])));
      expect(await vaultDataExists()).toBe(true);
    });
  });

  describe('deleteVaultData', () => {
    it('removes the vault from IndexedDB and legacy localStorage', async () => {
      await saveVaultData(new Uint8Array([1, 2, 3]));
      localStorage.setItem(LEGACY_KEY, toBase64(new Uint8Array([1])));

      await deleteVaultData();

      expect(await loadVaultData()).toBeNull();
      expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
      expect(await vaultDataExists()).toBe(false);
    });
  });
});
