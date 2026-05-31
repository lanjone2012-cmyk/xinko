# XINKO Space GitHub 自动部署

## 当前方式

Cloudflare Pages 已直接连接 GitHub 仓库：

`lanjone2012-cmyk/xinko`

生产分支：

`main`

仓库每次向 `main` 分支推送后，Cloudflare Pages 会自动部署到：

`https://xinko-space.pages.dev`

## 日常更新

以后只需要：

1. 修改网站文件。
2. 提交并推送到 GitHub `main`。
3. 等待 Cloudflare Pages 自动完成发布。

## 说明

不再需要 GitHub Actions、`CLOUDFLARE_ACCOUNT_ID` 或 `CLOUDFLARE_API_TOKEN`。
