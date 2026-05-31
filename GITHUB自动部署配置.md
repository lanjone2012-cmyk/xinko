# XINKO Space GitHub 自动部署

## 已配置

仓库每次向 `main` 分支推送后，GitHub Actions 会自动部署到：

`https://xinko-space.pages.dev`

工作流文件：

`.github/workflows/deploy-pages.yml`

## 需要在 GitHub 填写的 Secrets

进入仓库：

`Settings` → `Secrets and variables` → `Actions` → `New repository secret`

添加：

1. `CLOUDFLARE_ACCOUNT_ID`
2. `CLOUDFLARE_API_TOKEN`

## Cloudflare Token 权限

创建 Token 时选择：

`Account` → `Cloudflare Pages` → `Edit`

资源范围选择当前 Cloudflare 账号。

## 日常更新

以后只需要：

1. 修改网站文件。
2. 提交并推送到 GitHub `main`。
3. 等待 GitHub Actions 自动完成发布。
