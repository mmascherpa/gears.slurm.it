/**
 * Tests for Password Vault Export Utilities
 */
import { describe, it, expect } from 'vitest';
import {
  exportToCSV,
  exportToJSON,
  getExportFilename
} from '@/utils/passwordVaultExport';

describe('passwordVaultExport', () => {
  describe('exportToCSV', () => {
    it('exports entries to CSV format', () => {
      const entries = [
        {
          name: 'GitHub',
          username: 'marco',
          email: 'marco@test.com',
          url: 'https://github.com',
          password: 'secret123',
          totp: '',
          note: 'My account',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z'
        }
      ];

      const csv = exportToCSV(entries);

      expect(csv).toContain('name,username,email,url,password,totp,note,created_at,updated_at');
      expect(csv).toContain('GitHub');
      expect(csv).toContain('marco');
      expect(csv).toContain('secret123');
    });

    it('escapes fields containing commas', () => {
      const entries = [
        {
          name: 'Test',
          username: 'user',
          password: 'pass,word',
          email: '',
          url: '',
          totp: '',
          note: '',
          createdAt: '',
          updatedAt: ''
        }
      ];

      const csv = exportToCSV(entries);
      expect(csv).toContain('"pass,word"');
    });

    it('escapes fields containing quotes', () => {
      const entries = [
        {
          name: 'Test',
          username: 'user',
          password: 'pass"word',
          email: '',
          url: '',
          totp: '',
          note: '',
          createdAt: '',
          updatedAt: ''
        }
      ];

      const csv = exportToCSV(entries);
      expect(csv).toContain('"pass""word"');
    });

    it('handles empty entries array', () => {
      const csv = exportToCSV([]);
      expect(csv).toContain('name,username,email,url,password,totp,note,created_at,updated_at');
      // Header row plus trailing newline creates 2 elements when split
      expect(csv.trim().split('\n')).toHaveLength(1);
    });

    it('handles null/undefined entries', () => {
      const csv = exportToCSV(null);
      expect(csv).toContain('name,username,email');
    });
  });

  describe('exportToJSON', () => {
    it('exports entries to JSON format', () => {
      const entries = [
        {
          id: '123',
          name: 'GitHub',
          username: 'marco',
          email: '',
          url: '',
          password: 'secret',
          totp: '',
          note: '',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ];

      const json = exportToJSON(entries);
      const parsed = JSON.parse(json);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('GitHub');
      expect(parsed[0].password).toBe('secret');
      // Should not include internal ID
      expect(parsed[0].id).toBeUndefined();
    });

    it('formats with indentation by default', () => {
      const entries = [{ name: 'Test', username: '', email: '', url: '', password: '', totp: '', note: '', createdAt: '', updatedAt: '' }];
      const json = exportToJSON(entries, true);

      expect(json).toContain('\n');
      expect(json).toContain('  ');
    });

    it('can export without formatting', () => {
      const entries = [{ name: 'Test', username: '', email: '', url: '', password: '', totp: '', note: '', createdAt: '', updatedAt: '' }];
      const json = exportToJSON(entries, false);

      expect(json).not.toContain('\n');
    });

    it('handles empty entries', () => {
      const json = exportToJSON([]);
      expect(JSON.parse(json)).toEqual([]);
    });
  });

  describe('getExportFilename', () => {
    it('generates CSV filename with date', () => {
      const filename = getExportFilename('csv');

      expect(filename).toMatch(/^slurm-passwords-\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('generates JSON filename with date', () => {
      const filename = getExportFilename('json');

      expect(filename).toMatch(/^slurm-passwords-\d{4}-\d{2}-\d{2}\.json$/);
    });

    it('includes current date', () => {
      const filename = getExportFilename('csv');
      const today = new Date().toISOString().split('T')[0];

      expect(filename).toContain(today);
    });
  });
});
