#!/bin/bash

ps --no-headers -eo pid,%cpu,%mem,comm --sort=-%cpu | head -5 | awk '
BEGIN { print "[" }
{
    if (NR > 1) print ","
    printf " {\"pid\": %s, \"name\": \"%s\", \"cpu\": %s, \"mem\": %s}", $1, $4, $2, $3
}
END { print "\n]"}
'