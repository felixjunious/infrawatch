#!/bin/bash

total_kb=$(df / | tail -1 | awk '{print $2}')
used_kb=$(df / | tail -1 | awk '{print $3}')

total_gb=$(( total_kb / 1024 / 1024 ))
used_gb=$(( used_kb / 1024 / 1024 ))

percent=$(echo "scale=1; 100 * $used_kb / $total_kb" | bc)

echo "{\"total_gb\": $total_gb, \"used_gb\": $used_gb, \"percent\": $percent}"