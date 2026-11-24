# GitHub Pages 部署

项目目录：`apac-er-process-labor-law`  
静态站点在 `web/`（与本地 `Test for Cursor\index.html` 同源）。

## 一键发布（已安装 GitHub CLI 且已登录）

```powershell
cd "C:\Users\roqian\Desktop\Test for Cursor\apac-er-process-labor-law"
.\publish-github.ps1
```

## 开启 Pages

仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。

或在首次 push 后 Actions 里手动运行 **Deploy GitHub Pages**。

## 公网地址

```text
https://roqianebay.github.io/apac-er-process-labor-law/
```

可把该 HTTPS 链接发给同事；不要用 `file://` 或 `127.0.0.1`。

## 日常更新

改 `web/` 下文件后 `git add` → `commit` → `push`，工作流会自动重新部署。