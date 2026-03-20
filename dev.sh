#!/bin/bash
# Tue les vieux processus
pkill -f "vite"
pkill -f "tsup"
# Relance propre
bun x turbo run dev --no-cache --no-daemon --continue
