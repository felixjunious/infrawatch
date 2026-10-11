#!/bin/bash

mem_total=$(grep MemTotal /proc/meminfo | awk '{print $2}')
mem_available=$(grep MemAvailable /proc/meminfo | awk '{print $2}')

mem_used=$(( mem_total - mem_available ))

total_mb=$((mem_total / 1024))
used_mb=$((mem_used / 1024))

percent=$(echo "scale=1; 100 * $mem_used / $mem_total" | bc)

echo "{\"total_mb\": $total_mb, \"used_mb\": $used_mb, \"percent\": $percent}"