import {
  dataSetLive,
  getActivePiecesByCursor,
  getNextChallengeEpoch,
} from "@filoz/synapse-core/pdp-verifier";
import { verifyMessage } from "viem";
import { getPDPProvider } from "@filoz/synapse-core/sp-registry";
import * as Piece from "@filoz/synapse-core/piece";
import { getSynapse } from "./filecoin";
import { sha256 } from "./runner";
import { receiptMessage } from "../agent/receipt";
import type { Receipt } from "../agent/types";
export async function verifyReceipt(receipt: Receipt) {
  if (!receipt.pieceCid || !receipt.payloadHash || !receipt.signature)
    throw new Error("This receipt does not contain a signed archive.");
  const decisionSignatureValid = receipt.decisionSignature
    ? await verifyMessage({
        address: receipt.address as `0x${string}`,
        message: receiptMessage(receipt as unknown as Record<string, unknown>),
        signature: receipt.decisionSignature as `0x${string}`,
      })
    : null;
  const signatureValid = await verifyMessage({
    address: receipt.address as `0x${string}`,
    message: `Memento archive SHA-256:${receipt.payloadHash}`,
    signature: receipt.signature as `0x${string}`,
  });
  const synapse = getSynapse();
  const parsedCid = Piece.tryFrom(receipt.pieceCid);
  if (!parsedCid) throw new Error("Invalid archive CID.");
  const retrievals = await Promise.all(
    (receipt.copies ?? []).map(async (copy) => {
      const provider = await getPDPProvider(synapse.readClient, {
        providerId: BigInt(copy.providerId),
      });
      if (!provider) throw new Error("Provider is no longer registered.");
      const url = Piece.createPieceUrlPDP({
        cid: parsedCid.toString(),
        serviceURL: provider.pdp.serviceURL,
      });
      const bytes = await Piece.downloadAndValidate({
        expectedPieceCid: parsedCid,
        url,
      });
      return {
        providerId: copy.providerId,
        bytes,
        hashMatches: sha256(bytes) === receipt.payloadHash,
      };
    }),
  );
  if (retrievals.length < 2)
    throw new Error("Two independent copies are required.");
  const bytes = retrievals[0].bytes;
  const actualHash = sha256(bytes);
  const hashMatches = retrievals.every((r) => r.hashMatches);
  const archive = JSON.parse(new TextDecoder().decode(bytes));
  const decisionMatches =
    archive.decisionId === receipt.id &&
    archive.chain.address.toLowerCase() === receipt.address.toLowerCase();
  const onchainCopies = await Promise.all(
    (receipt.copies ?? []).map(async (copy) => {
      const dataSetId = BigInt(copy.dataSetId);
      const [live, pieces, nextChallenge] = await Promise.all([
        dataSetLive(synapse.readClient, { dataSetId }),
        getActivePiecesByCursor(synapse.readClient, {
          dataSetId,
          cursor: BigInt(copy.pieceId),
          limit: 1n,
        }),
        getNextChallengeEpoch(synapse.readClient, { dataSetId }),
      ]);
      return {
        providerId: copy.providerId,
        dataSetId: copy.dataSetId,
        live,
        pieceIncluded: pieces.items.some(
          (p) =>
            p.id.toString() === copy.pieceId &&
            p.cid.toString() === receipt.pieceCid,
        ),
        nextChallengeEpoch: nextChallenge?.toString() ?? null,
      };
    }),
  );
  const onchainConfirmed =
    onchainCopies.length >= 2 &&
    new Set(onchainCopies.map((c) => c.providerId)).size >= 2 &&
    new Set(onchainCopies.map((c) => c.dataSetId)).size >= 2 &&
    onchainCopies.every((c) => c.live && c.pieceIncluded);
  return {
    verified:
      signatureValid &&
      hashMatches &&
      decisionMatches &&
      decisionSignatureValid !== false &&
      onchainConfirmed,
    onchainConfirmed,
    onchainCopies,
    retrievalCopies: retrievals.map((r) => ({
      providerId: r.providerId,
      bytes: r.bytes.byteLength,
      hashMatches: r.hashMatches,
    })),
    decisionSignatureValid,
    signatureValid,
    hashMatches,
    decisionMatches,
    bytes: bytes.byteLength,
    sha256: actualHash,
    checkedAt: new Date().toISOString(),
    note: "Checks agent signature and fresh retrieval integrity. This is not a PDP challenge proof or a guarantee of semantic correctness.",
  };
}
