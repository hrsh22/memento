import {
  dataSetLive,
  getActivePiecesByCursor,
  getNextChallengeEpoch,
} from "@filoz/synapse-core/pdp-verifier";
import { verifyMessage } from "viem";
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
  const bytes = await synapse.storage.download({
    pieceCid: receipt.pieceCid,
  });
  const actualHash = sha256(bytes);
  const hashMatches = actualHash === receipt.payloadHash;
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
