@echo off
title Herbarium - Registro de Limpeza e Atividades PWA
echo ============================================================
echo   Iniciando o Aplicativo Herbarium (PWA & Web)
echo ============================================================
echo.
echo Iniciando o servidor Vite...
echo Para acessar no celular: http://192.168.100.155:5173/
echo.

:: Aguarda 2 segundos para o Vite subir antes de abrir a aba no navegador
start "" /b cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5173/"

npm.cmd run dev
pause

