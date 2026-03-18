#!/bin/bash
set -e

adb devices || true

exec "$@"