/**
 * Discovery Uttarakhand — Cryptographic Service
 * Provides recursive deterministic stringification, salted canonical hash calculation,
 * and privacy-preserving vehicle permit digests.
 */

import crypto from 'crypto';
import { ethers } from 'ethers';

/**
 * Generate a cryptographically secure 32-byte random hex salt (0x-prefixed 64-char hex string)
 * Standard format across all off-chain and on-chain verification modules.
 */
export function generateSalt() {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

/**
 * Recursive deterministic object stringification
 * Guarantees exact byte-for-byte serialization across Node versions and platforms.
 * Handles undefined, functions, symbols, and Dates safely.
 */
export function stableStringify(obj) {
  if (obj === undefined || typeof obj === 'function' || typeof obj === 'symbol') {
    return 'null';
  }
  if (obj instanceof Date) {
    return JSON.stringify(obj.toISOString());
  }
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(stableStringify).join(',') + ']';
  }
  const sortedKeys = Object.keys(obj).sort();
  const entries = sortedKeys.map(key => {
    return JSON.stringify(key) + ':' + stableStringify(obj[key]);
  });
  return '{' + entries.join(',') + '}';
}

/**
 * Salted Canonical Payload for PartnerListing Attestation
 * Strict sorted keys; zero wallet address, zero PII, zero guessable registration numbers.
 * @param {Object} listing - PartnerListing document or draft object
 * @param {number} version - Attestation version number
 * @param {string} attestationSalt - 0x-prefixed 32-byte hex salt string
 */
export function buildListingCanonicalPayload(listing, version, attestationSalt) {
  return {
    attestationSalt: String(attestationSalt || ''),
    capacity: {
      bathrooms: Number(listing?.capacity?.bathrooms || 0),
      bedrooms: Number(listing?.capacity?.bedrooms || 0),
      maxGuests: Number(listing?.capacity?.maxGuests || 0)
    },
    category: String(listing?.category || ''),
    district: String(listing?.district || ''),
    listingId: String(listing?._id || listing?.id || ''),
    listingType: String(listing?.listingType || ''),
    pricing: {
      amount: Number(listing?.pricing?.amount || 0),
      currency: String(listing?.pricing?.currency || 'INR'),
      unit: String(listing?.pricing?.unit || 'night')
    },
    title: String(listing?.title || '').trim(),
    version: Number(version || 1)
  };
}

/**
 * Computes deterministic SHA-256 verification hash from canonical payload
 */
export function computeListingVerificationHash(canonicalPayload) {
  const canonicalString = stableStringify(canonicalPayload);
  return '0x' + crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');
}

/**
 * Converts a Mongo ObjectId to deterministic bytes32 listingIdHash
 */
export function computeListingIdHash(listingId) {
  return ethers.keccak256(ethers.toUtf8Bytes(String(listingId)));
}

/**
 * Salted Vehicle Identifier Hash: keccak256(normalizedPlate + vehicleSalt)
 * Note: vehicleSalt is always a 0x-prefixed 32-byte hex string (from generateSalt)
 * @param {string} registrationNumber - Raw license plate (e.g. "UK 07 TA 1234")
 * @param {string} vehicleSalt - 0x-prefixed 32-byte hex string
 */
export function computeSaltedVehicleHash(registrationNumber, vehicleSalt) {
  const normalized = String(registrationNumber).replace(/[\s-]/g, '').toUpperCase();
  return ethers.solidityPackedKeccak256(['string', 'string'], [normalized, String(vehicleSalt)]);
}

/**
 * Salted Vehicle Permit Digest: keccak256(permitType, district, validUntilTimestamp, permitSalt)
 * Note: permitSalt is always a 0x-prefixed 32-byte hex string (from generateSalt)
 * @param {string} permitType - e.g. "CHAR_DHAM_ALL_ACCESS"
 * @param {string} district - e.g. "Rudraprayag"
 * @param {number|Date|string} validUntilTimestamp - Unix timestamp in seconds or ISO Date
 * @param {string} permitSalt - 0x-prefixed 32-byte hex string
 */
export function computeSaltedPermitDigest(permitType, district, validUntilTimestamp, permitSalt) {
  const validUntilNum = typeof validUntilTimestamp === 'number' 
    ? validUntilTimestamp 
    : Math.floor(new Date(validUntilTimestamp).getTime() / 1000);
  return ethers.solidityPackedKeccak256(
    ['string', 'string', 'uint64', 'string'],
    [String(permitType), String(district), validUntilNum, String(permitSalt)]
  );
}
