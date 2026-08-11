import { blocksEditor } from "./blocks-editor";
import { foodiq } from "./foodiq";
import { paymentGateways } from "./payment-gateways";
import { propertyOps } from "./property-ops";
import { tenderStat } from "./tender-stat";
import { web3Terminal } from "./web3-terminal";

export const rawCases = [
  foodiq,
  blocksEditor,
  paymentGateways,
  propertyOps,
  web3Terminal,
  // `agentHarness` снят с показа вместе с демо `guardrails`: кейс и его страница
  // целы, но обещанного демо у них сейчас нет. Возвращать вместе с ним,
  // см. `src/widgets/demos/guardrails/index.ts`
  tenderStat,
];
