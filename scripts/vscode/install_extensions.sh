#!/usr/bin/env bash

set -eu
extensions_file="$GITPOD_REPO_ROOT/.vscode/extensions.json";
if test -e "$extensions_file"; then {
    mapfile -t extensions < <(jq '.[][]' "$extensions_file" | sed 's|"||g')
    gp ports await 23000 1>/dev/null;

    for extension in "${extensions[@]}"; do {
        code --install-extension "$extension";
    } done
} fi