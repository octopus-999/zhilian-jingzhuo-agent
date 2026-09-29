@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo [1/4] 构建生产版本...
call npm run build
if errorlevel 1 (echo 构建失败，已中止 & pause & exit /b 1)

echo [2/4] 检出 gh-pages 工作区...
if exist .deploy-tmp rmdir /s /q .deploy-tmp
git worktree add .deploy-tmp gh-pages
if errorlevel 1 (echo worktree 创建失败，已中止 & pause & exit /b 1)

echo [3/4] 替换为最新构建产物...
pushd .deploy-tmp
git rm -rf . --quiet
popd
xcopy /e /y /i /q dist\* .deploy-tmp\ >nul

pushd .deploy-tmp
git add -A
git diff --cached --quiet
if not errorlevel 1 (
  echo 内容无变化，无需发布
  popd
  git worktree remove .deploy-tmp --force
  pause
  exit /b 0
)
git commit -m "update gitee pages" --quiet

echo [4/4] 推送到 Gitee...
git push origin gh-pages
if errorlevel 1 (echo 推送失败，请检查网络与 Gitee 凭据 & popd & pause & exit /b 1)
popd

git worktree remove .deploy-tmp --force
echo.
echo 完成！网页链接: https://outopus.gitee.io/zhilian-jingzhuo-agent/
echo （Gitee Pages 更新有缓存，若未生效请到仓库「服务 -^> Gitee Pages」点「更新」）
pause
