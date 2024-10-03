#!/usr/bin/env bash
pacmd list-sources | \
        grep -oP 'index: \d+' | \
        awk '{ print $2 }' | \
        xargs -I{} pacmd set-source-volume {} 65000
