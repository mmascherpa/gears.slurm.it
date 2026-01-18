/**
 * Tests for Password Vault Import Utilities
 */
import { describe, it, expect } from 'vitest';
import {
  parsePasswordCSV,
  parsePasswordJSON,
  normalizeEntry,
  detectFileFormat,
  findDuplicates
} from '@/utils/passwordVaultImport';

describe('passwordVaultImport', () => {
  describe('parsePasswordCSV', () => {
    it('parses simple CSV with header', () => {
      const csv = 'name,username,password\nGitHub,marco,secret123';
      const result = parsePasswordCSV(csv);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('GitHub');
      expect(result[0].username).toBe('marco');
      expect(result[0].password).toBe('secret123');
    });

    it('parses CSV with quoted fields containing commas', () => {
      const csv = 'name,username,password\nTest,"user,name","pass,word"';
      const result = parsePasswordCSV(csv);

      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('user,name');
      expect(result[0].password).toBe('pass,word');
    });

    it('parses CSV with quoted fields containing quotes', () => {
      const csv = 'name,username,password\nTest,user,"He said ""hello"""';
      const result = parsePasswordCSV(csv);

      expect(result).toHaveLength(1);
      expect(result[0].password).toBe('He said "hello"');
    });

    it('parses pazgal export format', () => {
      const csv = `name,username,email,url,password,totp,note,created_at,updated_at
github,marco,marco@marco.com,https://github.com,"2Q2]hXHo6]^C|,:F",,it's a good password,2025-11-08T08:15:30.557470,2025-11-08T08:15:30.557470`;

      const result = parsePasswordCSV(csv);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('github');
      expect(result[0].username).toBe('marco');
      expect(result[0].email).toBe('marco@marco.com');
      expect(result[0].url).toBe('https://github.com');
      expect(result[0].password).toBe('2Q2]hXHo6]^C|,:F');
      expect(result[0].note).toBe("it's a good password");
    });

    it('handles multiple rows', () => {
      const csv = `name,username,password
Site1,user1,pass1
Site2,user2,pass2
Site3,user3,pass3`;

      const result = parsePasswordCSV(csv);
      expect(result).toHaveLength(3);
    });

    it('handles empty values', () => {
      const csv = 'name,username,password\nTest,,secret';
      const result = parsePasswordCSV(csv);

      expect(result[0].name).toBe('Test');
      expect(result[0].username).toBe('');
      expect(result[0].password).toBe('secret');
    });

    it('handles Windows line endings', () => {
      const csv = 'name,password\r\nTest1,pass1\r\nTest2,pass2';
      const result = parsePasswordCSV(csv);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Test1');
      expect(result[1].name).toBe('Test2');
    });

    it('returns empty array for empty input', () => {
      expect(parsePasswordCSV('')).toEqual([]);
      expect(parsePasswordCSV(null)).toEqual([]);
      expect(parsePasswordCSV(undefined)).toEqual([]);
    });

    it('returns empty array for header-only CSV', () => {
      const csv = 'name,username,password';
      const result = parsePasswordCSV(csv);
      expect(result).toEqual([]);
    });
  });

  describe('parsePasswordJSON', () => {
    it('parses JSON array', () => {
      const json = JSON.stringify([
        { name: 'Site1', username: 'user1', password: 'pass1' },
        { name: 'Site2', username: 'user2', password: 'pass2' }
      ]);

      const result = parsePasswordJSON(json);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Site1');
      expect(result[1].name).toBe('Site2');
    });

    it('parses object with entries array', () => {
      const json = JSON.stringify({
        version: 1,
        entries: [
          { name: 'Site1', password: 'pass1' }
        ]
      });

      const result = parsePasswordJSON(json);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Site1');
    });

    it('parses object with items array', () => {
      const json = JSON.stringify({
        items: [
          { name: 'Site1', password: 'pass1' }
        ]
      });

      const result = parsePasswordJSON(json);

      expect(result).toHaveLength(1);
    });

    it('returns empty array for invalid JSON', () => {
      expect(parsePasswordJSON('not json')).toEqual([]);
      expect(parsePasswordJSON('')).toEqual([]);
      expect(parsePasswordJSON(null)).toEqual([]);
    });
  });

  describe('normalizeEntry', () => {
    it('normalizes field names', () => {
      const raw = {
        title: 'My Site',
        login: 'myuser',
        pwd: 'mypass',
        uri: 'https://example.com',
        memo: 'Some notes'
      };

      const result = normalizeEntry(raw);

      expect(result.name).toBe('My Site');
      expect(result.username).toBe('myuser');
      expect(result.password).toBe('mypass');
      expect(result.url).toBe('https://example.com');
      expect(result.note).toBe('Some notes');
    });

    it('handles case variations', () => {
      const raw = {
        NAME: 'Test',
        USERNAME: 'user',
        PASSWORD: 'pass'
      };

      const result = normalizeEntry(raw);

      expect(result.name).toBe('Test');
      expect(result.username).toBe('user');
      expect(result.password).toBe('pass');
    });

    it('handles underscores in field names', () => {
      const raw = {
        user_name: 'testuser',
        created_at: '2024-01-01'
      };

      const result = normalizeEntry(raw);

      expect(result.username).toBe('testuser');
      expect(result.createdAt).toBe('2024-01-01');
    });

    it('provides default empty strings for missing fields', () => {
      const raw = { name: 'Test' };
      const result = normalizeEntry(raw);

      expect(result.username).toBe('');
      expect(result.email).toBe('');
      expect(result.url).toBe('');
      expect(result.password).toBe('');
      expect(result.totp).toBe('');
      expect(result.note).toBe('');
    });
  });

  describe('detectFileFormat', () => {
    it('detects .aes encrypted file', () => {
      const result = detectFileFormat('passwords.csv.aes', new Uint8Array());
      expect(result.isEncrypted).toBe(true);
      expect(result.algorithm).toBe('jsAesCrypt');
    });

    it('detects .enc encrypted file', () => {
      const result = detectFileFormat('data.json.enc', new Uint8Array());
      expect(result.isEncrypted).toBe(true);
      expect(result.algorithm).toBe('webCrypto');
    });

    it('detects .age encrypted file', () => {
      const result = detectFileFormat('vault.age', new Uint8Array());
      expect(result.isEncrypted).toBe(true);
      expect(result.algorithm).toBe('age');
    });

    it('detects JSON from content', () => {
      const content = '{"name": "test"}';
      const result = detectFileFormat('data.txt', content);
      expect(result.format).toBe('json');
      expect(result.isEncrypted).toBe(false);
    });

    it('detects JSON array from content', () => {
      const content = '[{"name": "test"}]';
      const result = detectFileFormat('data.txt', content);
      expect(result.format).toBe('json');
    });

    it('detects CSV by default', () => {
      const content = 'name,password\ntest,pass';
      const result = detectFileFormat('data.txt', content);
      expect(result.format).toBe('csv');
      expect(result.isEncrypted).toBe(false);
    });
  });

  describe('findDuplicates', () => {
    it('finds duplicate entries by name and username', () => {
      const existing = [
        { name: 'GitHub', username: 'marco', password: 'old' },
        { name: 'Gmail', username: 'marco', password: 'old2' }
      ];

      const newEntries = [
        { name: 'GitHub', username: 'marco', password: 'new' },
        { name: 'Twitter', username: 'marco', password: 'new2' }
      ];

      const duplicates = findDuplicates(existing, newEntries);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].existing.name).toBe('GitHub');
      expect(duplicates[0].new.password).toBe('new');
    });

    it('is case-insensitive', () => {
      const existing = [{ name: 'GitHub', username: 'Marco' }];
      const newEntries = [{ name: 'GITHUB', username: 'marco' }];

      const duplicates = findDuplicates(existing, newEntries);
      expect(duplicates).toHaveLength(1);
    });

    it('returns empty array when no duplicates', () => {
      const existing = [{ name: 'Site1', username: 'user1' }];
      const newEntries = [{ name: 'Site2', username: 'user2' }];

      const duplicates = findDuplicates(existing, newEntries);
      expect(duplicates).toHaveLength(0);
    });
  });
});
