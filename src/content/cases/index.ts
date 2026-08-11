import { agentHarness } from "./agent-harness";
import { blocksEditor } from "./blocks-editor";
import { foodiq } from "./foodiq";
import { paymentGateways } from "./payment-gateways";
import { propertyOps } from "./property-ops";
import { web3Terminal } from "./web3-terminal";

export const rawCases = [
  foodiq,
  blocksEditor,
  paymentGateways,
  propertyOps,
  web3Terminal,
  agentHarness,
];
