#!/bin/bash

# /proc/stat - (virtual) file where Linux kernel stores the raw CPU data
# /proc/stat is updated every second

# Read two snapshot of /proc/stat 0.2 seconds apart
read -r cpu user1 nice1 system1 idle1 iowait1 irq1 softirq1 rest1< /proc/stat
sleep 0.2
read -r cpu user2 nice2 system2 idle2 iowait2 irq2 softirq2 rest2< /proc/stat

# Calculate total and idle deltas
idle_delta=$(( (idle2 + iowait2) - (idle1 + iowait1) ))
total_delta=$(( (user2 + nice2 + system2 + idle2 + iowait2 + irq2 + softirq2) - (user1 + nice1 + system1 + idle1 + iowait1 + irq1 + softirq1) ))

# Calculate percentage
cpu_percent=$(echo "scale=1; 100 * ($total_delta - $idle_delta) / $total_delta" | bc)

echo "{\"cpu_percent\": $cpu_percent}"
