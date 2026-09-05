import { Synapse, calibration } from "@filoz/synapse-sdk";
import { getPriceList } from "@filoz/synapse-core/warm-storage";
import { formatUnits, http, maxUint256, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { ChainSnapshot } from "../agent/types";
export const DEMO_ADDRESS = "0xA704353cB48030557c307cB743581D49eFA1eF80";
export function getSynapse(signing = false) {
  const key = process.env.FILECOIN_PRIVATE_KEY;
  if (signing && !key)
    throw new Error(
      "Operator wallet is not configured. Set FILECOIN_PRIVATE_KEY on the server.",
    );
  const account = key
    ? privateKeyToAccount(key as `0x${string}`)
    : ((process.env.NEXT_PUBLIC_AGENT_ADDRESS || DEMO_ADDRESS) as Address);
  return Synapse.create({
    account,
    chain: calibration,
    transport: http(
      process.env.FILECOIN_RPC_URL || calibration.rpcUrls.default.http[0],
      { timeout: 20000, retryCount: 1 },
    ),
    source: "memento-v1",
    withCDN: false,
  });
}
const money = (n: bigint) => formatUnits(n, 18);
export async function readChain(): Promise<ChainSnapshot> {
  const synapse = getSynapse();
  const [summary, wallet, fil, prices, rails] = await Promise.all([
    synapse.payments.accountSummary(),
    synapse.payments.walletBalance(),
    synapse.readClient.getBalance({ address: synapse.client.account.address }),
    getPriceList(synapse.readClient),
    synapse.payments.getRailsAsPayer(),
  ]);
  const railDetails = await Promise.all(
    rails.map(async (r) => ({
      ...r,
      ...(await synapse.payments.getRail({ railId: r.railId })),
    })),
  );
  return {
    address: synapse.client.account.address,
    chainId: calibration.id,
    network: "Filecoin Calibration",
    epoch: summary.epoch.toString(),
    observedAt: new Date().toISOString(),
    funds: money(summary.funds),
    availableFunds: money(summary.availableFunds),
    debt: money(summary.debt),
    totalLockup: money(summary.totalLockup),
    monthlyRate: money(summary.lockupRatePerMonth),
    ratePerEpoch: summary.lockupRatePerEpoch.toString(),
    runwayDays:
      summary.runwayInEpochs === maxUint256
        ? null
        : Number(summary.runwayInEpochs) / 2880,
    walletUsdfc: money(wallet),
    walletFil: money(fil),
    contracts: {
      pay: calibration.contracts.filecoinPay.address,
      warmStorage: calibration.contracts.fwss.address,
      pdp: calibration.contracts.pdp.address,
      usdfc: calibration.contracts.usdfc.address,
    },
    prices: {
      storagePerTibMonth: Number(money(prices.rates.storagePerTibPerMonth)),
      datasetFeeMonth: Number(money(prices.rates.datasetFeePerMonth)),
      addBaseFee: Number(money(prices.fees.addPiecesBaseFee)),
      addPieceFee: Number(money(prices.fees.addPiecesPerPieceFee)),
    },
    rails: railDetails.map((r) => ({
      railId: r.railId.toString(),
      paymentRate: money(r.paymentRate),
      endEpoch: r.endEpoch.toString(),
    })),
  };
}
