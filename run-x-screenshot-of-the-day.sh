#!/usr/bin/env bash

set -euo pipefail

# Opens Terminal, launches copilot, waits for startup, then sends the command.
osascript <<'APPLESCRIPT'
tell application "Terminal"
	activate
	if (count of windows) = 0 then
		do script ""
	end if
	do script "cd /Users/ketchum/REPOS/cf-cl-lin-2 && copilot --yolo" in front window
	delay 10
	tell application "System Events"
		delay 1
		keystroke "/x-screenshot-of-the-day"
		delay 1
		keystroke return
	end tell
	delay 600
	tell application "System Events"
		delay 1
		keystroke "/exit"
		delay 1
		keystroke return
	end tell
	delay 10
	close front window
end tell
APPLESCRIPT
