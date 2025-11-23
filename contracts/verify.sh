#!/usr/bin/env bash
set -euo pipefail

JSON_PATH="broadcast/deploy.s.sol/114/run-latest.json"

CHAIN_ID=114
VERIFIER="blockscout"
VERIFIER_URL="https://api.routescan.io/v2/network/testnet/evm/114/etherscan/api"
COMPILER_VERSION="v0.8.28+commit.7893614a"

# Map broadcast contractName -> source path used by forge verify-contract
resolve_source() {
  local name="$1"
  case "$name" in
    Engine)
      echo "src/engine.sol:Engine"
      ;;
    Strategy)
      echo "src/strategy.sol:Strategy"
      ;;
    Oracle)
      echo "src/oracle.sol:Oracle"
      ;;
    KineticConnector)
      echo "src/connectors/lending/Kinetic.sol:KineticConnector"
      ;;
    SparkDexV2Connector)
      echo "src/connectors/dex/SparkDex/v2.sol:SparkDexV2Connector"
      ;;
    SparkDexV3Connector)
      echo "src/connectors/dex/SparkDex/v3.sol:SparkDexV3Connector"
      ;;
    *)
      echo ""  # unknown
      ;;
  esac
}

# Requires jq
jq -c '.transactions[] | select(.transactionType == "CREATE") | {name: .contractName, address: .contractAddress}' "$JSON_PATH" |
while read -r entry; do
  name=$(jq -r '.name' <<<"$entry")
  addr=$(jq -r '.address' <<<"$entry")

  src=$(resolve_source "$name")
  if [ -z "$src" ]; then
    echo "Skipping unknown contract '$name' at $addr" >&2
    continue
  fi

  echo "Verifying $name at $addr with source $src"
  forge verify-contract \
    "$addr" \
    "$src" \
    --chain-id "$CHAIN_ID" \
    --verifier "$VERIFIER" \
    --verifier-url "$VERIFIER_URL" \
    --compiler-version "$COMPILER_VERSION"
done