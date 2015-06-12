@echo off

:CHECKSWSAVES

IF EXIST sw_saves\NUL GOTO RUNGAME

md sw_saves

IF errorlevel 0 GOTO RUNGAME

ECHO Unable to create "sw_saves" folder. Please ensure disk is write-enabled...
PAUSE
GOTO CHECKSWSAVES

:RUNGAME

sw_game %1

IF errorlevel 0 GOTO END

ECHO.
ECHO Game terminated abnormally.
ECHO.
ECHO Due to limitations with Windows DOS this game will only run from a folder whose
ECHO path is no more than 64 characters long. It appears that you have exceeded this
ECHO limit.
ECHO.
ECHO To resolve this problem, please re-install this game to a folder with a short
ECHO path.
ECHO.
ECHO For example, c:\games\sw
ECHO.
ECHO Note - when re-installing, you must remember to preserve the original folder
ECHO        structure. So, in the above example, you would also have a folder called
ECHO        c:\games\sw\teams
ECHO.

pause

:END