@echo off
title VerifIQ - Gestao e Rastreabilidade Digital BPF (Neon DB)
echo ============================================================
echo   Iniciando o VerifIQ com Banco Neon PostgreSQL em Nuvem
echo ============================================================
echo.
echo Iniciando servidor Vite + API Backend Neon...
echo Acesso local: http://localhost:5173/
echo.

:: Aguarda 2 segundos para os servidores subirem antes de abrir a aba no navegador
start "" /b cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5173/"

npm.cmd run dev:all
pause

